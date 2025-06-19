import { users, jobs, proposals, type User, type Job, type Proposal } from "../shared/schema.js";
import { db } from "./database.js";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;

  // Job operations
  getJobs(): Promise<Job[]>;
  getJobById(id: number): Promise<Job | undefined>;
  createJob(insertJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job>;
  updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined>;

  // Proposal operations
  getProposalsByJobId(jobId: number): Promise<Proposal[]>;
  getProposalsByFreelancerId(freelancerId: string): Promise<Proposal[]>;
  createProposal(insertProposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Proposal>;
  updateProposal(id: number, proposalData: Partial<Proposal>): Promise<Proposal | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        id: `${insertUser.userType}_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Job operations
  async getJobs(): Promise<Job[]> {
    const jobList = await db
      .select()
      .from(jobs)
      .where(eq(jobs.status, 'active'))
      .orderBy(desc(jobs.createdAt));
    return jobList;
  }

  async getJobById(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async createJob(insertJob: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values({
        ...insertJob,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return job;
  }

  async updateJob(id: number, jobData: Partial<Job>): Promise<Job | undefined> {
    const [job] = await db
      .update(jobs)
      .set({ ...jobData, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job || undefined;
  }

  // Proposal operations
  async getProposalsByJobId(jobId: number): Promise<Proposal[]> {
    const proposalList = await db
      .select()
      .from(proposals)
      .where(eq(proposals.jobId, jobId))
      .orderBy(desc(proposals.createdAt));
    return proposalList;
  }

  async getProposalsByFreelancerId(freelancerId: string): Promise<Proposal[]> {
    const proposalList = await db
      .select()
      .from(proposals)
      .where(eq(proposals.freelancerId, freelancerId))
      .orderBy(desc(proposals.createdAt));
    return proposalList;
  }

  async createProposal(insertProposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Proposal> {
    const [proposal] = await db
      .insert(proposals)
      .values({
        ...insertProposal,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return proposal;
  }

  async updateProposal(id: number, proposalData: Partial<Proposal>): Promise<Proposal | undefined> {
    const [proposal] = await db
      .update(proposals)
      .set({ ...proposalData, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    return proposal || undefined;
  }
}

export const storage = new DatabaseStorage();