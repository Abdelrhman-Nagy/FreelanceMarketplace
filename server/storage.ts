import {
  users,
  jobs,
  proposals,
  messages,
  contracts,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, count, sql } from "drizzle-orm";

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

    const conditions = [eq(jobs.status, "open")];

    if (category) {
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
    // Get unique conversation partners with last message
    const conversationQuery = sql`
      WITH conversation_partners AS (
        SELECT DISTINCT
          CASE 
            WHEN sender_id = ${userId} THEN receiver_id
            ELSE sender_id
          END as other_user_id
        FROM messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
      ),
      last_messages AS (
        SELECT DISTINCT ON (
          CASE 
            WHEN sender_id = ${userId} THEN receiver_id
            ELSE sender_id
          END
        )
          *,
          CASE 
            WHEN sender_id = ${userId} THEN receiver_id
            ELSE sender_id
          END as other_user_id
        FROM messages
        WHERE sender_id = ${userId} OR receiver_id = ${userId}
        ORDER BY other_user_id, created_at DESC
      )
      SELECT 
        cp.other_user_id,
        lm.*
      FROM conversation_partners cp
      JOIN last_messages lm ON cp.other_user_id = lm.other_user_id
      ORDER BY lm.created_at DESC
    `;

    const lastMessages = await db.execute(conversationQuery);

    const conversations = [];
    for (const row of lastMessages.rows) {
      const otherUserId = row.other_user_id as string;
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
          lastMessage: {
            id: row.id as number,
            senderId: row.sender_id as string,
            receiverId: row.receiver_id as string,
            content: row.content as string,
            jobId: row.job_id as number | null,
            proposalId: row.proposal_id as number | null,
            read: row.read as boolean,
            createdAt: new Date(row.created_at as string),
          },
          unreadCount: unreadResult.count,
        });
      }
    }

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
}

export const storage = new DatabaseStorage();
