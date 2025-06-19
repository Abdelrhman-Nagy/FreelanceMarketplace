import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Database service for compatibility
class DatabaseService {
  constructor() {
    this.isConnected = true;
  }

  async testConnection() {
    try {
      await db.execute('SELECT 1 as test');
      return { status: 'connected', error: null };
    } catch (error) {
      return { status: 'disconnected', error: error.message };
    }
  }

  async getJobs() {
    try {
      const jobs = await db.query.jobs.findMany({
        where: (jobs, { eq }) => eq(jobs.status, 'active'),
        with: {
          client: true,
        },
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
      });

      return jobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        budget: this.calculateBudget(job),
        category: job.category,
        skills: this.parseSkills(job.skills),
        experienceLevel: job.experienceLevel,
        clientId: job.clientId,
        clientName: job.client ? `${job.client.firstName} ${job.client.lastName}` : 'Unknown Client',
        clientCompany: job.client?.company,
        clientRating: job.client?.rating || 0,
        status: job.status,
        createdAt: job.createdAt,
        budgetType: job.budgetType,
        duration: job.duration,
        remote: job.remote,
        proposalCount: job.proposalCount || 0
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  async getJobById(jobId) {
    try {
      const job = await db.query.jobs.findFirst({
        where: (jobs, { eq }) => eq(jobs.id, parseInt(jobId)),
        with: {
          client: true,
        },
      });

      if (!job) {
        return null;
      }

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        budget: this.calculateBudget(job),
        category: job.category,
        skills: this.parseSkills(job.skills),
        experienceLevel: job.experienceLevel,
        clientId: job.clientId,
        clientName: job.client ? `${job.client.firstName} ${job.client.lastName}` : 'Unknown Client',
        clientCompany: job.client?.company,
        clientRating: job.client?.rating || 0,
        clientTotalJobs: job.client?.totalJobs || 0,
        status: job.status,
        createdAt: job.createdAt,
        budgetType: job.budgetType,
        duration: job.duration,
        remote: job.remote,
        proposalCount: job.proposalCount || 0
      };
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
      });

      if (!user) {
        return {
          totalJobs: 0,
          activeProposals: 0,
          completedContracts: 0,
          totalEarnings: 0,
          rating: 0
        };
      }

      // Get additional stats from related tables
      const activeJobs = await db.query.jobs.findMany({
        where: (jobs, { eq, and }) => and(
          eq(jobs.clientId, userId),
          eq(jobs.status, 'active')
        ),
      });

      return {
        totalJobs: user.totalJobs || 0,
        activeJobs: activeJobs.length,
        activeProposals: 3, // This would come from proposals table
        completedContracts: 8, // This would come from contracts table
        totalEarnings: 12500, // This would come from a contracts/payments table
        rating: user.rating || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Helper methods
  calculateBudget(job) {
    if (job.budgetType === 'fixed') {
      return job.budgetMax || job.budgetMin || 0;
    } else if (job.budgetType === 'hourly') {
      return job.hourlyRate || 0;
    }
    return 0;
  }

  parseSkills(skillsString) {
    if (!skillsString) return [];
    
    if (Array.isArray(skillsString)) return skillsString;
    
    try {
      return JSON.parse(skillsString);
    } catch (e) {
      return skillsString.split(',').map(s => s.trim());
    }
  }
}

// Export singleton instance
const dbService = new DatabaseService();
export default dbService;