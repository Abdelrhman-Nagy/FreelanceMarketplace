import { sqlServerDb } from "./db-sqlserver";
import {
  users,
  jobs,
  proposals,
  messages,
  contracts,
  adminStats,
  userSuspensions,
  type User,
  type UpsertUser,
  type InsertJob,
  type Job,
  type InsertProposal,
  type Proposal,
  type InsertMessage,
  type Message,
  type InsertContract,
  type Contract,
  type AdminStats,
  type InsertSuspension,
  type Suspension,
} from "@shared/schema";

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

export class SqlServerStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await sqlServerDb.query('SELECT * FROM users WHERE id = @param0', [id]);
    const user = result.recordset[0];
    if (user) {
      return {
        ...user,
        skills: user.skills ? JSON.parse(user.skills) : [],
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at)
      };
    }
    return undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      // Update existing user
      const query = `
        UPDATE users SET 
          email = @param1,
          first_name = @param2,
          last_name = @param3,
          profile_image_url = @param4,
          user_type = @param5,
          title = @param6,
          bio = @param7,
          hourly_rate = @param8,
          skills = @param9,
          location = @param10,
          company = @param11,
          updated_at = GETDATE()
        WHERE id = @param0
      `;
      const params = [
        userData.id,
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.profileImageUrl,
        userData.userType,
        userData.title,
        userData.bio,
        userData.hourlyRate,
        JSON.stringify(userData.skills || []),
        userData.location,
        userData.company
      ];
      await sqlServerDb.query(query, params);
    } else {
      // Insert new user
      const query = `
        INSERT INTO users (id, email, first_name, last_name, profile_image_url, user_type, title, bio, hourly_rate, skills, location, company, created_at, updated_at)
        VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, @param11, GETDATE(), GETDATE())
      `;
      const params = [
        userData.id,
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.profileImageUrl,
        userData.userType,
        userData.title,
        userData.bio,
        userData.hourlyRate,
        JSON.stringify(userData.skills || []),
        userData.location,
        userData.company
      ];
      await sqlServerDb.query(query, params);
    }
    
    return await this.getUser(userData.id) as User;
  }

  // Job operations
  async createJob(job: InsertJob): Promise<Job> {
    const query = `
      INSERT INTO jobs (title, description, client_id, status, budget_type, budget_min, budget_max, hourly_rate, category, experience_level, skills, remote, created_at, updated_at)
      OUTPUT INSERTED.id
      VALUES (@param0, @param1, @param2, 'open', @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, GETDATE(), GETDATE())
    `;
    const params = [
      job.title,
      job.description,
      job.clientId,
      job.budgetType,
      job.budgetMin,
      job.budgetMax,
      job.hourlyRate,
      job.category,
      job.experienceLevel,
      JSON.stringify(job.skills || []),
      job.remote ?? true
    ];
    
    const result = await sqlServerDb.query(query, params);
    const jobId = result.recordset[0].id;
    
    return await this.getJob(jobId) as Job;
  }

  async getJobs(filters: any = {}): Promise<{ jobs: Job[]; total: number }> {
    let whereClause = '';
    const params: any[] = [];
    let paramIndex = 0;

    if (filters.category) {
      whereClause += ` AND j.category = @param${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters.search) {
      whereClause += ` AND (j.title LIKE @param${paramIndex} OR j.description LIKE @param${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const query = `
      SELECT j.*, u.first_name + ' ' + ISNULL(u.last_name, '') as client_name
      FROM jobs j
      INNER JOIN users u ON j.client_id = u.id
      WHERE 1=1 ${whereClause}
      ORDER BY j.created_at DESC
      OFFSET ${filters.offset || 0} ROWS
      FETCH NEXT ${filters.limit || 50} ROWS ONLY
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      WHERE 1=1 ${whereClause}
    `;

    const [jobsResult, countResult] = await Promise.all([
      sqlServerDb.query(query, params),
      sqlServerDb.query(countQuery, params)
    ]);

    const jobs = jobsResult.recordset.map((job: any) => ({
      ...job,
      skills: job.skills ? JSON.parse(job.skills) : [],
      remote: Boolean(job.remote),
      createdAt: new Date(job.created_at),
      updatedAt: new Date(job.updated_at)
    }));

    return {
      jobs,
      total: countResult.recordset[0].total
    };
  }

  async getJob(id: number): Promise<Job | undefined> {
    const result = await sqlServerDb.query('SELECT * FROM jobs WHERE id = @param0', [id]);
    const job = result.recordset[0];
    if (job) {
      return {
        ...job,
        skills: job.skills ? JSON.parse(job.skills) : [],
        remote: Boolean(job.remote),
        createdAt: new Date(job.created_at),
        updatedAt: new Date(job.updated_at)
      };
    }
    return undefined;
  }

  async getJobWithClient(id: number): Promise<(Job & { client: User }) | undefined> {
    const query = `
      SELECT j.*, u.id as client_id, u.email as client_email, u.first_name as client_first_name, 
             u.last_name as client_last_name, u.profile_image_url as client_profile_image_url
      FROM jobs j
      INNER JOIN users u ON j.client_id = u.id
      WHERE j.id = @param0
    `;
    
    const result = await sqlServerDb.query(query, [id]);
    const row = result.recordset[0];
    
    if (row) {
      const job = {
        id: row.id,
        title: row.title,
        description: row.description,
        clientId: row.client_id,
        status: row.status,
        budgetType: row.budget_type,
        budgetMin: row.budget_min,
        budgetMax: row.budget_max,
        hourlyRate: row.hourly_rate,
        category: row.category,
        experienceLevel: row.experience_level,
        skills: row.skills ? JSON.parse(row.skills) : [],
        remote: Boolean(row.remote),
        proposalCount: row.proposal_count,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };

      const client = {
        id: row.client_id,
        email: row.client_email,
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        profileImageUrl: row.client_profile_image_url,
        userType: 'client' as const,
        skills: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return { ...job, client };
    }
    
    return undefined;
  }

  async updateJob(id: number, updates: Partial<InsertJob>): Promise<Job> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = @param${index + 1}`).join(', ');
    const query = `UPDATE jobs SET ${setClause}, updated_at = GETDATE() WHERE id = @param0`;
    const params = [id, ...Object.values(updates)];
    
    await sqlServerDb.query(query, params);
    return await this.getJob(id) as Job;
  }

  async deleteJob(id: number): Promise<void> {
    await sqlServerDb.query('DELETE FROM jobs WHERE id = @param0', [id]);
  }

  async getJobsByClient(clientId: string): Promise<Job[]> {
    const result = await sqlServerDb.query('SELECT * FROM jobs WHERE client_id = @param0 ORDER BY created_at DESC', [clientId]);
    return result.recordset.map((job: any) => ({
      ...job,
      skills: job.skills ? JSON.parse(job.skills) : [],
      remote: Boolean(job.remote),
      createdAt: new Date(job.created_at),
      updatedAt: new Date(job.updated_at)
    }));
  }

  // Proposal operations
  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const query = `
      INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_rate, timeline, status, created_at, updated_at)
      OUTPUT INSERTED.id
      VALUES (@param0, @param1, @param2, @param3, @param4, 'pending', GETDATE(), GETDATE())
    `;
    const params = [proposal.jobId, proposal.freelancerId, proposal.coverLetter, proposal.proposedRate, proposal.timeline];
    
    const result = await sqlServerDb.query(query, params);
    const proposalId = result.recordset[0].id;
    
    return await this.getProposal(proposalId) as Proposal;
  }

  async getProposalsByJob(jobId: number): Promise<(Proposal & { freelancer: User })[]> {
    const query = `
      SELECT p.*, u.first_name, u.last_name, u.email, u.profile_image_url
      FROM proposals p
      INNER JOIN users u ON p.freelancer_id = u.id
      WHERE p.job_id = @param0
      ORDER BY p.created_at DESC
    `;
    
    const result = await sqlServerDb.query(query, [jobId]);
    return result.recordset.map((row: any) => ({
      id: row.id,
      jobId: row.job_id,
      freelancerId: row.freelancer_id,
      coverLetter: row.cover_letter,
      proposedRate: row.proposed_rate,
      timeline: row.timeline,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      freelancer: {
        id: row.freelancer_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        profileImageUrl: row.profile_image_url,
        userType: 'freelancer' as const,
        skills: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }));
  }

  async getProposalsByFreelancer(freelancerId: string): Promise<(Proposal & { job: Job })[]> {
    const query = `
      SELECT p.*, j.title, j.description, j.budget_type, j.budget_min, j.budget_max, j.hourly_rate
      FROM proposals p
      INNER JOIN jobs j ON p.job_id = j.id
      WHERE p.freelancer_id = @param0
      ORDER BY p.created_at DESC
    `;
    
    const result = await sqlServerDb.query(query, [freelancerId]);
    return result.recordset.map((row: any) => ({
      id: row.id,
      jobId: row.job_id,
      freelancerId: row.freelancer_id,
      coverLetter: row.cover_letter,
      proposedRate: row.proposed_rate,
      timeline: row.timeline,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      job: {
        id: row.job_id,
        title: row.title,
        description: row.description,
        clientId: '',
        status: 'open' as const,
        budgetType: row.budget_type,
        budgetMin: row.budget_min,
        budgetMax: row.budget_max,
        hourlyRate: row.hourly_rate,
        category: '',
        experienceLevel: 'intermediate' as const,
        skills: [],
        remote: true,
        proposalCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }));
  }

  async getProposal(id: number): Promise<Proposal | undefined> {
    const result = await sqlServerDb.query('SELECT * FROM proposals WHERE id = @param0', [id]);
    const proposal = result.recordset[0];
    if (proposal) {
      return {
        id: proposal.id,
        jobId: proposal.job_id,
        freelancerId: proposal.freelancer_id,
        coverLetter: proposal.cover_letter,
        proposedRate: proposal.proposed_rate,
        timeline: proposal.timeline,
        status: proposal.status,
        createdAt: new Date(proposal.created_at),
        updatedAt: new Date(proposal.updated_at)
      };
    }
    return undefined;
  }

  async updateProposal(id: number, updates: Partial<InsertProposal>): Promise<Proposal> {
    const setClause = Object.keys(updates).map((key, index) => `${key} = @param${index + 1}`).join(', ');
    const query = `UPDATE proposals SET ${setClause}, updated_at = GETDATE() WHERE id = @param0`;
    const params = [id, ...Object.values(updates)];
    
    await sqlServerDb.query(query, params);
    return await this.getProposal(id) as Proposal;
  }

  async deleteProposal(id: number): Promise<void> {
    await sqlServerDb.query('DELETE FROM proposals WHERE id = @param0', [id]);
  }

  // Stub implementations for remaining methods
  async createMessage(message: InsertMessage): Promise<Message> {
    throw new Error('Method not implemented yet');
  }

  async getConversations(userId: string): Promise<{ otherUserId: string; otherUser: User; lastMessage: Message; unreadCount: number; }[]> {
    return [];
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string, limit?: number): Promise<Message[]> {
    return [];
  }

  async markMessagesAsRead(receiverId: string, senderId: string): Promise<void> {
    // Implementation needed
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return 0;
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    throw new Error('Method not implemented yet');
  }

  async getContractsByFreelancer(freelancerId: string): Promise<(Contract & { job: Job; client: User; })[]> {
    return [];
  }

  async getContractsByClient(clientId: string): Promise<(Contract & { job: Job; freelancer: User; })[]> {
    return [];
  }

  async updateContract(id: number, updates: Partial<InsertContract>): Promise<Contract> {
    throw new Error('Method not implemented yet');
  }

  async getAllUsers(filters?: any): Promise<{ users: User[]; total: number; }> {
    const result = await sqlServerDb.query('SELECT * FROM users ORDER BY created_at DESC');
    const users = result.recordset.map((user: any) => ({
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : [],
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at)
    }));
    return { users, total: users.length };
  }

  async getAllJobs(filters?: any): Promise<{ jobs: (Job & { client: User; })[]; total: number; }> {
    const query = `
      SELECT j.*, u.id as client_id, u.first_name as client_first_name, u.last_name as client_last_name, u.email as client_email
      FROM jobs j
      INNER JOIN users u ON j.client_id = u.id
      ORDER BY j.created_at DESC
    `;
    
    const result = await sqlServerDb.query(query);
    const jobs = result.recordset.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      clientId: row.client_id,
      status: row.status,
      budgetType: row.budget_type,
      budgetMin: row.budget_min,
      budgetMax: row.budget_max,
      hourlyRate: row.hourly_rate,
      category: row.category,
      experienceLevel: row.experience_level,
      skills: row.skills ? JSON.parse(row.skills) : [],
      remote: Boolean(row.remote),
      proposalCount: row.proposal_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      client: {
        id: row.client_id,
        firstName: row.client_first_name,
        lastName: row.client_last_name,
        email: row.client_email,
        userType: 'client' as const,
        skills: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }));
    
    return { jobs, total: jobs.length };
  }

  async getAllProposals(filters?: any): Promise<{ proposals: (Proposal & { job: Job; freelancer: User; })[]; total: number; }> {
    return { proposals: [], total: 0 };
  }

  async getAdminStats(): Promise<AdminStats> {
    const result = await sqlServerDb.query('SELECT * FROM admin_stats ORDER BY updated_at DESC');
    const stats = result.recordset[0];
    if (stats) {
      return {
        id: stats.id,
        totalUsers: stats.total_users,
        totalJobs: stats.total_jobs,
        totalProposals: stats.total_proposals,
        totalContracts: stats.total_contracts,
        totalRevenue: stats.total_revenue,
        updatedAt: new Date(stats.updated_at)
      };
    }
    return {
      id: 1,
      totalUsers: 0,
      totalJobs: 0,
      totalProposals: 0,
      totalContracts: 0,
      totalRevenue: 0,
      updatedAt: new Date()
    };
  }

  async updateAdminStats(): Promise<void> {
    // Implementation needed
  }

  async suspendUser(suspension: InsertSuspension): Promise<Suspension> {
    throw new Error('Method not implemented yet');
  }

  async unsuspendUser(userId: string): Promise<void> {
    // Implementation needed
  }

  async getUserSuspensions(userId: string): Promise<Suspension[]> {
    return [];
  }

  async deleteUser(userId: string): Promise<void> {
    await sqlServerDb.query('DELETE FROM users WHERE id = @param0', [userId]);
  }

  async updateUserRole(userId: string, userType: string): Promise<User> {
    await sqlServerDb.query('UPDATE users SET user_type = @param1, updated_at = GETDATE() WHERE id = @param0', [userId, userType]);
    return await this.getUser(userId) as User;
  }
}

export const sqlServerStorage = new SqlServerStorage();