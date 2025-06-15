import {
  users,
  jobs,
  proposals,
  messages,
  contracts,
  userSuspensions,
  adminStats,
  type User,
  type UpsertUser,
  type Job,
  type InsertJob,
  type Proposal,
  type InsertProposal,
  type Message,
  type InsertMessage,
  type Contract,
  type InsertContract,
  type Suspension,
  type InsertSuspension,
  type AdminStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, count, sql, isNull, not } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJobs(filters?: {
    category?: string;
    budgetMin?: number;
    budgetMax?: number;
    experienceLevel?: string;
    search?: string;
    skills?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: Job[]; total: number }>;
  getJob(id: number): Promise<Job | undefined>;
  getJobWithClient(id: number): Promise<(Job & { client: User }) | undefined>;
  updateJob(id: number, updates: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  getJobsByClient(clientId: string): Promise<Job[]>;

  // Proposal operations
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  getProposalsByJob(jobId: number): Promise<(Proposal & { freelancer: User })[]>;
  getProposalsByFreelancer(freelancerId: string): Promise<(Proposal & { job: Job })[]>;
  getProposal(id: number): Promise<Proposal | undefined>;
  updateProposal(id: number, updates: Partial<InsertProposal>): Promise<Proposal>;
  deleteProposal(id: number): Promise<void>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversations(userId: string): Promise<{
    otherUserId: string;
    otherUser: User;
    lastMessage: Message;
    unreadCount: number;
  }[]>;
  getMessagesBetweenUsers(user1Id: string, user2Id: string, limit?: number): Promise<Message[]>;
  markMessagesAsRead(receiverId: string, senderId: string): Promise<void>;
  getUnreadMessageCount(userId: string): Promise<number>;

  // Contract operations
  createContract(contract: InsertContract): Promise<Contract>;
  getContractsByFreelancer(freelancerId: string): Promise<(Contract & { job: Job; client: User })[]>;
  getContractsByClient(clientId: string): Promise<(Contract & { job: Job; freelancer: User })[]>;
  updateContract(id: number, updates: Partial<InsertContract>): Promise<Contract>;

  // Admin operations
  getAllUsers(filters?: {
    userType?: string;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ users: User[]; total: number }>;
  getAllJobs(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ jobs: (Job & { client: User })[]; total: number }>;
  getAllProposals(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ proposals: (Proposal & { job: Job; freelancer: User })[]; total: number }>;
  getAdminStats(): Promise<AdminStats>;
  updateAdminStats(): Promise<void>;
  suspendUser(suspension: InsertSuspension): Promise<Suspension>;
  unsuspendUser(userId: string): Promise<void>;
  getUserSuspensions(userId: string): Promise<Suspension[]>;
  deleteUser(userId: string): Promise<void>;
  updateUserRole(userId: string, userType: string): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJobs(filters: {
    category?: string;
    budgetMin?: number;
    budgetMax?: number;
    experienceLevel?: string;
    search?: string;
    skills?: string[];
    limit?: number;
    offset?: number;
  } = {}): Promise<{ jobs: Job[]; total: number }> {
    const { limit = 10, offset = 0, category, budgetMin, budgetMax, experienceLevel, search, skills } = filters;

    let query = db.select().from(jobs);
    let countQuery = db.select({ count: count() }).from(jobs);

    const conditions = [
      eq(jobs.status, "open"),
      // Exclude jobs that have completed contracts using NOT EXISTS
      sql`NOT EXISTS (
        SELECT 1 FROM ${contracts} 
        WHERE ${contracts.jobId} = ${jobs.id} 
        AND ${contracts.status} = 'completed'
      )`
    ];

    if (category && category !== "all") {
      conditions.push(eq(jobs.category, category));
    }

    if (budgetMin !== undefined) {
      conditions.push(sql`${jobs.budgetMin} >= ${budgetMin}`);
    }

    if (budgetMax !== undefined) {
      conditions.push(sql`${jobs.budgetMax} <= ${budgetMax}`);
    }

    if (experienceLevel) {
      conditions.push(eq(jobs.experienceLevel, experienceLevel));
    }

    if (search) {
      conditions.push(
        or(
          like(jobs.title, `%${search}%`),
          like(jobs.description, `%${search}%`)
        )
      );
    }

    if (skills && skills.length > 0) {
      conditions.push(sql`${jobs.skills} && ${skills}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    const [jobResults, countResult] = await Promise.all([
      query.orderBy(desc(jobs.createdAt)).limit(limit).offset(offset),
      countQuery,
    ]);

    return {
      jobs: jobResults,
      total: countResult[0].count,
    };
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobWithClient(id: number): Promise<(Job & { client: User }) | undefined> {
    const [result] = await db
      .select()
      .from(jobs)
      .leftJoin(users, eq(jobs.clientId, users.id))
      .where(eq(jobs.id, id));

    if (!result || !result.users) return undefined;

    return {
      ...result.jobs,
      client: result.users,
    };
  }

  async updateJob(id: number, updates: Partial<InsertJob>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async deleteJob(id: number): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getJobsByClient(clientId: string): Promise<Job[]> {
    return await db.select().from(jobs).where(eq(jobs.clientId, clientId)).orderBy(desc(jobs.createdAt));
  }

  // Proposal operations
  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const [newProposal] = await db.insert(proposals).values(proposal).returning();
    
    // Increment proposal count for the job
    await db
      .update(jobs)
      .set({ proposalCount: sql`${jobs.proposalCount} + 1` })
      .where(eq(jobs.id, proposal.jobId));

    return newProposal;
  }

  async getProposalsByJob(jobId: number): Promise<(Proposal & { freelancer: User })[]> {
    const results = await db
      .select()
      .from(proposals)
      .leftJoin(users, eq(proposals.freelancerId, users.id))
      .where(eq(proposals.jobId, jobId))
      .orderBy(desc(proposals.createdAt));

    return results.map(result => ({
      ...result.proposals,
      freelancer: result.users!,
    }));
  }

  async getProposalsByFreelancer(freelancerId: string): Promise<(Proposal & { job: Job })[]> {
    const results = await db
      .select()
      .from(proposals)
      .leftJoin(jobs, eq(proposals.jobId, jobs.id))
      .where(eq(proposals.freelancerId, freelancerId))
      .orderBy(desc(proposals.createdAt));

    return results.map(result => ({
      ...result.proposals,
      job: result.jobs!,
    }));
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    const [proposal] = await db.select().from(proposals).where(eq(proposals.id, id));
    return proposal;
  }

  async updateProposal(id: number, updates: Partial<InsertProposal>): Promise<Proposal> {
    const [proposal] = await db
      .update(proposals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    return proposal;
  }

  async deleteProposal(id: number): Promise<void> {
    const proposal = await this.getProposal(id);
    if (proposal) {
      await db.delete(proposals).where(eq(proposals.id, id));
      
      // Decrement proposal count for the job
      await db
        .update(jobs)
        .set({ proposalCount: sql`${jobs.proposalCount} - 1` })
        .where(eq(jobs.id, proposal.jobId));
    }
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getConversations(userId: string): Promise<{
    otherUserId: string;
    otherUser: User;
    lastMessage: Message;
    unreadCount: number;
  }[]> {
    // Get all messages involving the user
    const userMessages = await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    // Group by conversation partner and get latest message
    const conversationMap = new Map();
    
    for (const message of userMessages) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, message);
      }
    }

    const conversations = [];
    for (const [otherUserId, lastMessage] of Array.from(conversationMap.entries())) {
      const otherUser = await this.getUser(otherUserId);
      
      if (otherUser) {
        // Get unread count
        const [unreadResult] = await db
          .select({ count: count() })
          .from(messages)
          .where(
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId),
              eq(messages.read, false)
            )
          );

        conversations.push({
          otherUserId,
          otherUser,
          lastMessage,
          unreadCount: unreadResult.count,
        });
      }
    }

    // Sort by last message date
    conversations.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
    );

    return conversations;
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string, limit = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(asc(messages.createdAt))
      .limit(limit);
  }

  async markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.receiverId, receiverId),
          eq(messages.senderId, senderId),
          eq(messages.read, false)
        )
      );
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );

    return result.count;
  }

  // Contract operations
  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract).returning();
    
    // Update job status to in_progress
    await db
      .update(jobs)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(jobs.id, contract.jobId));

    // Update proposal status to accepted
    await db
      .update(proposals)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(proposals.id, contract.proposalId));

    return newContract;
  }

  async getContractsByFreelancer(freelancerId: string): Promise<(Contract & { job: Job; client: User })[]> {
    const results = await db
      .select()
      .from(contracts)
      .leftJoin(jobs, eq(contracts.jobId, jobs.id))
      .leftJoin(users, eq(contracts.clientId, users.id))
      .where(eq(contracts.freelancerId, freelancerId))
      .orderBy(desc(contracts.createdAt));

    return results.map(result => ({
      ...result.contracts,
      job: result.jobs!,
      client: result.users!,
    }));
  }

  async getContractsByClient(clientId: string): Promise<(Contract & { job: Job; freelancer: User })[]> {
    const results = await db
      .select()
      .from(contracts)
      .leftJoin(jobs, eq(contracts.jobId, jobs.id))
      .leftJoin(users, eq(contracts.freelancerId, users.id))
      .where(eq(contracts.clientId, clientId))
      .orderBy(desc(contracts.createdAt));

    return results.map(result => ({
      ...result.contracts,
      job: result.jobs!,
      freelancer: result.users!,
    }));
  }

  async updateContract(id: number, updates: Partial<InsertContract>): Promise<Contract> {
    const [contract] = await db
      .update(contracts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contracts.id, id))
      .returning();
    return contract;
  }

  // Admin operations
  async getAllUsers(filters: {
    userType?: string;
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ users: User[]; total: number }> {
    const { limit = 50, offset = 0, userType, search, status } = filters;

    let query = db.select().from(users);
    let countQuery = db.select({ count: count() }).from(users);

    const conditions = [];

    if (userType && userType !== 'all') {
      conditions.push(eq(users.userType, userType));
    }

    if (search) {
      conditions.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    const [userResults, countResult] = await Promise.all([
      query.orderBy(desc(users.createdAt)).limit(limit).offset(offset),
      countQuery,
    ]);

    return {
      users: userResults,
      total: countResult[0].count,
    };
  }

  async getAllJobs(filters: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ jobs: (Job & { client: User })[]; total: number }> {
    const { limit = 50, offset = 0, status, search } = filters;

    let query = db
      .select()
      .from(jobs)
      .leftJoin(users, eq(jobs.clientId, users.id));
    
    let countQuery = db.select({ count: count() }).from(jobs);

    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(eq(jobs.status, status));
    }

    if (search) {
      conditions.push(
        or(
          like(jobs.title, `%${search}%`),
          like(jobs.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    const [jobResults, countResult] = await Promise.all([
      query.orderBy(desc(jobs.createdAt)).limit(limit).offset(offset),
      countQuery,
    ]);

    return {
      jobs: jobResults.map(result => ({
        ...result.jobs,
        client: result.users!,
      })),
      total: countResult[0].count,
    };
  }

  async getAllProposals(filters: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ proposals: (Proposal & { job: Job; freelancer: User })[]; total: number }> {
    const { limit = 50, offset = 0, status } = filters;

    let query = db
      .select()
      .from(proposals)
      .leftJoin(jobs, eq(proposals.jobId, jobs.id))
      .leftJoin(users, eq(proposals.freelancerId, users.id));
    
    let countQuery = db.select({ count: count() }).from(proposals);

    const conditions = [];

    if (status && status !== 'all') {
      conditions.push(eq(proposals.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
      countQuery = countQuery.where(and(...conditions));
    }

    const [proposalResults, countResult] = await Promise.all([
      query.orderBy(desc(proposals.createdAt)).limit(limit).offset(offset),
      countQuery,
    ]);

    return {
      proposals: proposalResults.map(result => ({
        ...result.proposals,
        job: result.jobs!,
        freelancer: result.users!,
      })),
      total: countResult[0].count,
    };
  }

  async getAdminStats(): Promise<AdminStats> {
    // Get or create admin stats
    let [stats] = await db.select().from(adminStats).limit(1);
    
    if (!stats) {
      // Create initial stats record
      await this.updateAdminStats();
      [stats] = await db.select().from(adminStats).limit(1);
    }

    return stats;
  }

  async updateAdminStats(): Promise<void> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [jobCount] = await db.select({ count: count() }).from(jobs);
    const [proposalCount] = await db.select({ count: count() }).from(proposals);
    const [contractCount] = await db.select({ count: count() }).from(contracts);

    // Calculate total revenue (sum of all contract earnings)
    const [revenueResult] = await db
      .select({ total: sql`COALESCE(SUM(${contracts.totalEarnings}), 0)` })
      .from(contracts);

    const statsData = {
      totalUsers: userCount.count,
      totalJobs: jobCount.count,
      totalProposals: proposalCount.count,
      totalContracts: contractCount.count,
      totalRevenue: revenueResult.total as string,
      updatedAt: new Date(),
    };

    // Upsert stats
    const [existingStats] = await db.select().from(adminStats).limit(1);
    
    if (existingStats) {
      await db
        .update(adminStats)
        .set(statsData)
        .where(eq(adminStats.id, existingStats.id));
    } else {
      await db.insert(adminStats).values(statsData);
    }
  }

  async suspendUser(suspension: InsertSuspension): Promise<Suspension> {
    const [newSuspension] = await db
      .insert(userSuspensions)
      .values(suspension)
      .returning();
    return newSuspension;
  }

  async unsuspendUser(userId: string): Promise<void> {
    await db
      .update(userSuspensions)
      .set({ isActive: false })
      .where(and(eq(userSuspensions.userId, userId), eq(userSuspensions.isActive, true)));
  }

  async getUserSuspensions(userId: string): Promise<Suspension[]> {
    return await db
      .select()
      .from(userSuspensions)
      .where(eq(userSuspensions.userId, userId))
      .orderBy(desc(userSuspensions.createdAt));
  }

  async deleteUser(userId: string): Promise<void> {
    // Delete user and all related data
    await db.transaction(async (tx) => {
      // Delete user suspensions
      await tx.delete(userSuspensions).where(eq(userSuspensions.userId, userId));
      
      // Delete messages
      await tx.delete(messages).where(
        or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
      );
      
      // Delete contracts where user is involved
      await tx.delete(contracts).where(
        or(eq(contracts.freelancerId, userId), eq(contracts.clientId, userId))
      );
      
      // Delete proposals by user
      await tx.delete(proposals).where(eq(proposals.freelancerId, userId));
      
      // Delete jobs by user
      await tx.delete(jobs).where(eq(jobs.clientId, userId));
      
      // Finally delete the user
      await tx.delete(users).where(eq(users.id, userId));
    });
  }

  async updateUserRole(userId: string, userType: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ userType, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }
}

// Database switcher - set DB_TYPE environment variable to 'sqlserver' to use SQL Server
const DB_TYPE = process.env.DB_TYPE || 'postgresql';

// Import SQL Server storage conditionally
let sqlServerStorage: any = null;
if (DB_TYPE === 'sqlserver') {
  try {
    const { sqlServerStorage: sqlServerStorageImpl } = require('./storage-sqlserver');
    sqlServerStorage = sqlServerStorageImpl;
  } catch (error) {
    console.warn('SQL Server storage not available, falling back to PostgreSQL');
  }
}

export const storage = DB_TYPE === 'sqlserver' && sqlServerStorage 
  ? sqlServerStorage 
  : new DatabaseStorage();
