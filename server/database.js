import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, sql, or, inArray, desc, isNull } from 'drizzle-orm';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import * as schema from "../shared/schema.js";

const { Pool } = pg;

let pool = null;
let db = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log('Database configuration successful');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
} else {
  console.log('DATABASE_URL not found in environment variables');
}

export { pool, db };

// Authentication constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Session middleware configuration
export const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'freelance-platform-dev-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'sessionId'
});

// Database service for compatibility
class DatabaseService {
  constructor() {
    this.isConnected = true;
  }

  async testConnection() {
    if (!db) {
      return {
        status: 'not_configured',
        database: 'postgresql',
        timestamp: new Date().toISOString(),
        error: 'DATABASE_URL not configured',
        config: {}
      };
    }

    try {
      const result = await db.execute(sql`SELECT 1 as test`);
      console.log('Database connection test successful');
      
      return {
        status: 'connected',
        database: 'postgresql',
        timestamp: new Date().toISOString(),
        config: {
          host: process.env.PGHOST || 'localhost',
          database: process.env.PGDATABASE || 'unknown',
          port: process.env.PGPORT || '5432',
          user: process.env.PGUSER || 'unknown'
        }
      };
    } catch (error) {
      console.error('Database connection test failed:', error);
      console.error('Error details:', error.stack);
      
      // Try to reconnect
      try {
        if (process.env.DATABASE_URL && !pool) {
          console.log('Attempting to reconnect to database...');
          pool = new Pool({ connectionString: process.env.DATABASE_URL });
          db = drizzle({ client: pool, schema });
          console.log('Database reconnection successful');
        }
      } catch (reconnectError) {
        console.error('Reconnection failed:', reconnectError);
      }
      
      return {
        status: 'failed',
        database: 'postgresql',
        timestamp: new Date().toISOString(),
        error: error.message,
        config: {}
      };
    }
  }

  async getJobs() {
    if (!db) {
      throw new Error('Database not configured. Please set DATABASE_URL in web.config');
    }

    try {
      console.log('Fetching jobs from database...');
      const { jobs, users } = schema;
      
      // Test database connection first
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      // First try a simple query to test connection
      const allJobs = await db.select().from(jobs);
      console.log(`Found ${allJobs.length} total jobs in database`);
      
      const jobsWithClients = await db
        .select({
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          category: jobs.category,
          skills: jobs.skills,
          budgetMin: jobs.budgetMin,
          budgetMax: jobs.budgetMax,
          budgetType: jobs.budgetType,
          experienceLevel: jobs.experienceLevel,
          duration: jobs.duration,
          status: jobs.status,
          proposalCount: jobs.proposalCount,
          createdAt: jobs.createdAt,
          clientId: jobs.clientId,
          clientName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('clientName'),
          clientCompany: users.company,
          clientRating: users.rating
        })
        .from(jobs)
        .leftJoin(users, eq(jobs.clientId, users.id))
        .where(and(
          eq(jobs.status, 'active'),
          or(
            eq(jobs.approvalStatus, 'approved'),
            isNull(jobs.approvalStatus) // Include legacy jobs without approval status
          )
        ))
        .orderBy(jobs.createdAt);

      console.log(`Filtered ${jobsWithClients.length} active jobs`);

      const result = jobsWithClients.map(job => {
        console.log('Processing job:', job.id, job.title);
        return {
          ...job,
          skills: this.parseSkills(job.skills),
          budget: this.calculateBudget(job)
        };
      });
      
      console.log('Jobs processed successfully, final count:', result.length);
      console.log('Sample processed job:', result[0] ? JSON.stringify(result[0], null, 2) : 'No processed jobs');
      return result;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      console.error('Error details:', error.stack);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  }

  async getJobById(jobId) {
    if (!db) {
      throw new Error('Database not configured. Please set DATABASE_URL in web.config');
    }

    try {
      const { jobs, users } = schema;
      const [job] = await db
        .select({
          id: jobs.id,
          title: jobs.title,
          description: jobs.description,
          category: jobs.category,
          skills: jobs.skills,
          budgetMin: jobs.budgetMin,
          budgetMax: jobs.budgetMax,
          budgetType: jobs.budgetType,
          experienceLevel: jobs.experienceLevel,
          duration: jobs.duration,
          status: jobs.status,
          proposalCount: jobs.proposalCount,
          createdAt: jobs.createdAt,
          clientId: jobs.clientId,
          clientName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('clientName'),
          clientCompany: users.company,
          clientRating: users.rating
        })
        .from(jobs)
        .leftJoin(users, eq(jobs.clientId, users.id))
        .where(eq(jobs.id, parseInt(jobId)));

      if (!job) {
        return null;
      }

      return {
        ...job,
        skills: this.parseSkills(job.skills),
        budget: this.calculateBudget(job)
      };
    } catch (error) {
      console.error('Error fetching job by ID:', error);
      throw new Error(`Failed to fetch job: ${error.message}`);
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

      const proposals = await db.query.proposals.findMany({
        where: (proposals, { eq }) => eq(proposals.freelancerId, userId),
      });

      return {
        totalJobs: user.totalJobs || 0,
        activeJobs: activeJobs.length,
        activeProposals: proposals.filter(p => p.status === 'pending').length,
        completedContracts: proposals.filter(p => p.status === 'accepted').length,
        totalEarnings: 12500, // This would come from a contracts/payments table
        rating: user.rating ? (user.rating / 10) : 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Helper methods
  calculateBudget(job) {
    try {
      if (job.budgetType === 'fixed') {
        if (job.budgetMin && job.budgetMax) {
          return `$${job.budgetMin} - $${job.budgetMax}`;
        } else if (job.budgetMin) {
          return `$${job.budgetMin}`;
        }
        return 'Budget not specified';
      } else if (job.budgetType === 'hourly') {
        return job.hourlyRate ? `$${job.hourlyRate}/hour` : 'Rate not specified';
      }
      return 'Budget not specified';
    } catch (error) {
      console.error('Error calculating budget:', error);
      return 'Budget not specified';
    }
  }

  parseSkills(skillsString) {
    try {
      if (!skillsString) return [];
      
      if (Array.isArray(skillsString)) return skillsString;
      
      if (typeof skillsString === 'string') {
        try {
          return JSON.parse(skillsString);
        } catch {
          return skillsString.split(',').map(s => s.trim());
        }
      }
      
      return Array.isArray(skillsString) ? skillsString : [];
    } catch (error) {
      console.error('Error parsing skills:', error);
      return [];
    }
  }

  // Project Management Methods
  async getUserProjects(userId, userType) {
    try {
      let whereClause;
      
      if (userType === 'client') {
        whereClause = (projects, { eq }) => eq(projects.clientId, userId);
      } else if (userType === 'freelancer') {
        whereClause = (projects, { eq, or }) => or(
          eq(projects.freelancerId, userId),
          // Also include projects where user is a member
        );
      } else {
        // Admin can see all projects
        whereClause = undefined;
      }
      
      const projects = await db.query.projects.findMany({
        where: whereClause,
        with: {
          client: true,
          freelancer: true,
          job: true,
          members: {
            with: {
              user: true,
            },
          },
        },
        orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
      });

      // For freelancers, also include projects where they are members
      let additionalProjects = [];
      if (userType === 'freelancer') {
        const memberProjects = await db.query.projects.findMany({
          where: (projects, { eq, and, inArray }) => and(
            inArray(projects.id, 
              db.select({ projectId: schema.projectMembers.projectId })
                .from(schema.projectMembers)
                .where(eq(schema.projectMembers.userId, userId))
            )
          ),
          with: {
            client: true,
            freelancer: true,
            job: true,
            members: {
              with: {
                user: true,
              },
            },
          },
        });
        
        additionalProjects = memberProjects.filter(
          mp => !projects.some(p => p.id === mp.id)
        );
      }

      const allProjects = [...projects, ...additionalProjects];

      return allProjects.map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        clientId: project.clientId,
        clientName: project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Unknown Client',
        freelancerId: project.freelancerId,
        freelancerName: project.freelancer ? `${project.freelancer.firstName} ${project.freelancer.lastName}` : null,
        jobId: project.jobId,
        jobTitle: project.job?.title,
        status: project.status,
        deadline: project.deadline,
        budget: project.budget ? project.budget / 100 : 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        userRole: this.getUserProjectRole(project, userId)
      }));
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  }

  getUserProjectRole(project, userId) {
    if (project.clientId === userId) return 'client';
    if (project.freelancerId === userId) return 'freelancer';
    const member = project.members?.find(m => m.userId === userId);
    return member ? member.role : 'viewer';
  }

  async getProjectById(projectId) {
    try {
      const project = await db.query.projects.findFirst({
        where: (projects, { eq }) => eq(projects.id, projectId),
        with: {
          client: true,
          freelancer: true,
          job: true,
          members: {
            with: {
              user: true,
            },
          },
        },
      });

      if (!project) {
        return null;
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        clientId: project.clientId,
        clientName: project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Unknown Client',
        freelancerId: project.freelancerId,
        freelancerName: project.freelancer ? `${project.freelancer.firstName} ${project.freelancer.lastName}` : null,
        jobId: project.jobId,
        jobTitle: project.job?.title,
        status: project.status,
        deadline: project.deadline,
        budget: project.budget ? project.budget / 100 : 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        members: project.members.map(member => ({
          id: member.id,
          userId: member.userId,
          userName: `${member.user.firstName} ${member.user.lastName}`,
          userEmail: member.user.email,
          role: member.role,
          joinedAt: member.joinedAt
        }))
      };
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  }

  async getProjectTasks(projectId) {
    try {
      const tasks = await db.query.tasks.findMany({
        where: (tasks, { eq }) => eq(tasks.projectId, projectId),
        with: {
          assignee: true,
        },
        orderBy: (tasks, { asc }) => [asc(tasks.dueDate)],
      });

      return tasks.map(task => ({
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        assigneeName: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : null,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  async getProjectMessages(projectId) {
    try {
      const messages = await db.query.projectMessages.findMany({
        where: (messages, { eq }) => eq(messages.projectId, projectId),
        with: {
          sender: true,
        },
        orderBy: (messages, { asc }) => [asc(messages.createdAt)],
      });

      return messages.map(message => ({
        id: message.id,
        projectId: message.projectId,
        senderId: message.senderId,
        senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        senderEmail: message.sender.email,
        message: message.message,
        messageType: message.messageType,
        createdAt: message.createdAt
      }));
    } catch (error) {
      console.error('Error fetching project messages:', error);
      throw error;
    }
  }

  async createProjectMessage(messageData) {
    try {
      const [message] = await db.insert(schema.projectMessages).values({
        projectId: messageData.projectId,
        senderId: messageData.senderId,
        message: messageData.message,
        messageType: messageData.messageType || 'text',
        createdAt: new Date()
      }).returning();

      // Get sender info
      const sender = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, messageData.senderId),
      });

      return {
        id: message.id,
        projectId: message.projectId,
        senderId: message.senderId,
        senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown User',
        senderEmail: sender?.email,
        message: message.message,
        messageType: message.messageType,
        createdAt: message.createdAt
      };
    } catch (error) {
      console.error('Error creating project message:', error);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const [task] = await db.insert(schema.tasks).values({
        projectId: taskData.projectId,
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo,
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Get assignee info if exists
      let assigneeName = null;
      if (task.assignedTo) {
        const assignee = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, task.assignedTo),
        });
        assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null;
      }

      return {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        assigneeName: assigneeName,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(taskId, updates) {
    try {
      const [task] = await db.update(schema.tasks)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(schema.tasks.id, taskId))
        .returning();

      // Get assignee info if exists
      let assigneeName = null;
      if (task.assignedTo) {
        const assignee = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, task.assignedTo),
        });
        assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null;
      }

      return {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        assigneeName: assigneeName,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Proposals Management
  async createProposal(proposalData) {
    try {
      console.log('Creating proposal with data:', proposalData);
      
      const query = `
        INSERT INTO proposals (freelancer_id, job_id, cover_letter, proposed_rate, estimated_duration, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        proposalData.freelancerId,
        proposalData.jobId,
        proposalData.coverLetter,
        proposalData.proposedRate,
        proposalData.estimatedDuration,
        proposalData.status || 'pending'
      ];
      
      const result = await pool.query(query, values);
      console.log('Proposal created successfully:', result.rows[0]);
      
      // Update job proposal count
      await pool.query(`
        UPDATE jobs 
        SET proposal_count = (
          SELECT COUNT(*) FROM proposals WHERE job_id = $1
        )
        WHERE id = $1
      `, [proposalData.jobId]);
      
      return {
        id: result.rows[0].id,
        freelancerId: result.rows[0].freelancer_id,
        jobId: result.rows[0].job_id,
        coverLetter: result.rows[0].cover_letter,
        proposedRate: result.rows[0].proposed_rate,
        estimatedDuration: result.rows[0].estimated_duration,
        status: result.rows[0].status,
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      };
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }

  async getUserProposals(userId) {
    try {
      const proposals = await db.query.proposals.findMany({
        where: (proposals, { eq }) => eq(proposals.freelancerId, userId),
        with: {
          job: {
            with: {
              client: true,
            },
          },
        },
        orderBy: (proposals, { desc }) => [desc(proposals.createdAt)],
      });

      return proposals.map(proposal => ({
        id: proposal.id,
        jobId: proposal.jobId,
        jobTitle: proposal.job.title,
        clientName: proposal.job.client ? `${proposal.job.client.firstName} ${proposal.job.client.lastName}` : 'Unknown Client',
        coverLetter: proposal.coverLetter,
        proposedRate: proposal.proposedRate,
        estimatedDuration: proposal.estimatedDuration,
        status: proposal.status,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching user proposals:', error);
      throw error;
    }
  }

  // Saved Jobs Management
  async saveJob(userId, jobId) {
    try {
      const [savedJob] = await db.insert(schema.savedJobs).values({
        userId: userId,
        jobId: jobId,
        savedAt: new Date()
      }).returning();

      return savedJob;
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Job is already saved');
      }
      console.error('Error saving job:', error);
      throw error;
    }
  }

  async unsaveJob(userId, jobId) {
    try {
      await db.delete(schema.savedJobs)
        .where(and(
          eq(schema.savedJobs.userId, userId),
          eq(schema.savedJobs.jobId, jobId)
        ));
    } catch (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  }

  async getSavedJobs(userId) {
    try {
      const savedJobs = await db.query.savedJobs.findMany({
        where: (savedJobs, { eq }) => eq(savedJobs.userId, userId),
        with: {
          job: {
            with: {
              client: true,
            },
          },
        },
        orderBy: (savedJobs, { desc }) => [desc(savedJobs.savedAt)],
      });

      return savedJobs.map(saved => ({
        id: saved.id,
        jobId: saved.job.id,
        jobTitle: saved.job.title,
        jobDescription: saved.job.description,
        budget: this.calculateBudget(saved.job),
        category: saved.job.category,
        clientName: saved.job.client ? `${saved.job.client.firstName} ${saved.job.client.lastName}` : 'Unknown Client',
        clientCompany: saved.job.client?.company,
        savedAt: saved.savedAt
      }));
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      throw error;
    }
  }

  // Get proposals for a specific job (client access)
  async getJobProposals(jobId) {
    try {
      const proposals = await db.query.proposals.findMany({
        where: (proposals, { eq }) => eq(proposals.jobId, jobId),
        with: {
          freelancer: true,
        },
        orderBy: (proposals, { desc }) => [desc(proposals.createdAt)],
      });

      return proposals.map(proposal => ({
        id: proposal.id,
        jobId: proposal.jobId,
        freelancerId: proposal.freelancerId,
        freelancerName: `${proposal.freelancer.firstName} ${proposal.freelancer.lastName}`,
        freelancerEmail: proposal.freelancer.email,
        freelancerTitle: proposal.freelancer.title,
        freelancerSkills: this.parseSkills(proposal.freelancer.skills),
        coverLetter: proposal.coverLetter,
        proposedRate: proposal.proposedRate,
        estimatedDuration: proposal.estimatedDuration,
        status: proposal.status,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt
      }));
    } catch (error) {
      console.error('Error fetching job proposals:', error);
      throw error;
    }
  }

  // Update proposal status (client only)
  async updateProposalStatus(proposalId, status, clientId) {
    try {
      // First verify the proposal belongs to the client's job
      const proposal = await db.query.proposals.findFirst({
        where: (proposals, { eq }) => eq(proposals.id, proposalId),
        with: {
          job: true,
        },
      });

      if (!proposal || proposal.job.clientId !== clientId) {
        throw new Error('Access denied: You can only update proposals for your own jobs');
      }

      const [updatedProposal] = await db.update(schema.proposals)
        .set({
          status: status,
          updatedAt: new Date()
        })
        .where(eq(schema.proposals.id, proposalId))
        .returning();

      return updatedProposal;
    } catch (error) {
      console.error('Error updating proposal status:', error);
      throw error;
    }
  }

  // User management methods
  async getUserByEmail(email) {
    try {
      if (!db) {
        console.error('Database not initialized - check DATABASE_URL in web.config');
        throw new Error('Database not initialized');
      }

      console.log('Searching for user with email:', email);
      
      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);

      console.log('Database query result count:', users.length);
      
      if (users.length > 0) {
        console.log('User found:', users[0].id, users[0].email);
        return users[0];
      } else {
        console.log('No user found with email:', email);
        return null;
      }

    } catch (error) {
      console.error('Error getting user by email:', error);
      console.error('Database error details:', error.message);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      const users = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      return users.length > 0 ? users[0] : null;

    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      const result = await db
        .insert(schema.users)
        .values(userData)
        .returning();

      console.log('User created successfully:', result[0].id);
      return result[0];

    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      const result = await db
        .update(schema.users)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, userId))
        .returning();

      if (result.length === 0) {
        throw new Error('User not found');
      }

      console.log('User updated successfully:', userId);
      return result[0];

    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async createUserSession(sessionData) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      const result = await db
        .insert(schema.userSessions)
        .values(sessionData)
        .returning();

      return result[0];

    } catch (error) {
      console.error('Error creating user session:', error);
      throw error;
    }
  }

  async updateUserLoginTime(userId) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      await db
        .update(schema.users)
        .set({ lastLoginAt: new Date() })
        .where(eq(schema.users.id, userId));

    } catch (error) {
      console.error('Error updating user login time:', error);
      throw error;
    }
  }

  async createJob(jobData) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      const [newJob] = await db
        .insert(schema.jobs)
        .values(jobData)
        .returning();

      console.log('Job created successfully:', newJob.id);
      return newJob;

    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }

  // Authentication methods
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  async verifyPassword(password, hashedPassword) {
    if (!hashedPassword || typeof hashedPassword !== 'string') {
      console.log('Invalid hashed password provided:', typeof hashedPassword);
      return false;
    }
    
    if (!password || typeof password !== 'string') {
      console.log('Invalid password provided:', typeof password);
      return false;
    }
    
    try {
      console.log('Comparing password with hash...');
      const result = await bcrypt.compare(password, hashedPassword);
      console.log('Password comparison result:', result);
      return result;
    } catch (error) {
      console.error('Password verification error:', error);
      console.error('Password verification error details:', error.message);
      return false;
    }
  }

  async createSession(userId) {
    const sessionId = crypto.randomUUID();
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    await this.createUserSession({
      id: sessionId,
      userId,
      token,
      expiresAt
    });

    return { sessionId, token, expiresAt };
  }

  async validateSession(token) {
    try {
      const query = `
        SELECT us.*, u.id as user_id, u.email, u.user_type, u.first_name, u.last_name
        FROM user_sessions us
        JOIN users u ON us.user_id = u.id
        WHERE us.token = $1 AND us.expires_at > NOW()
      `;
      
      const result = await pool.query(query, [token]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return {
        session: result.rows[0],
        user: {
          id: result.rows[0].user_id,
          email: result.rows[0].email,
          userType: result.rows[0].user_type,
          firstName: result.rows[0].first_name,
          lastName: result.rows[0].last_name
        }
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  async deleteSession(token) {
    try {
      const query = 'DELETE FROM user_sessions WHERE token = $1';
      await pool.query(query, [token]);
      return true;
    } catch (error) {
      console.error('Session deletion error:', error);
      return false;
    }
  }

  async getUserStatistics(userId, userType) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      if (userType === 'client') {
        // Get client statistics
        const jobsStats = await db
          .select({
            totalJobs: sql`COUNT(*)`,
            activeJobs: sql`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
            totalSpent: sql`SUM(CASE WHEN budget_min IS NOT NULL AND budget_max IS NOT NULL THEN (budget_min + budget_max) / 2 ELSE 0 END)`
          })
          .from(schema.jobs)
          .where(eq(schema.jobs.clientId, userId));

        return {
          totalJobsPosted: Number(jobsStats[0]?.totalJobs) || 0,
          activeJobs: Number(jobsStats[0]?.activeJobs) || 0,
          totalSpent: Number(jobsStats[0]?.totalSpent) || 0,
          memberSince: null // Will be set from user creation date
        };
      } else {
        // Get freelancer statistics
        const proposalsStats = await db
          .select({
            totalProposals: sql`COUNT(*)`,
            acceptedProposals: sql`SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END)`,
            pendingProposals: sql`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`
          })
          .from(schema.proposals)
          .where(eq(schema.proposals.freelancerId, userId));

        // Get saved jobs count
        const savedJobsStats = await db
          .select({
            savedJobsCount: sql`COUNT(*)`
          })
          .from(schema.savedJobs)
          .where(eq(schema.savedJobs.userId, userId));

        return {
          totalProposals: Number(proposalsStats[0]?.totalProposals) || 0,
          acceptedProposals: Number(proposalsStats[0]?.acceptedProposals) || 0,
          pendingProposals: Number(proposalsStats[0]?.pendingProposals) || 0,
          savedJobs: Number(savedJobsStats[0]?.savedJobsCount) || 0,
          totalEarnings: 0, // This would come from completed projects/contracts
          memberSince: null // Will be set from user creation date
        };
      }

    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  async getContracts(userId, userType) {
    try {
      if (!db) {
        throw new Error('Database not initialized');
      }

      // Get accepted proposals that serve as contracts
      const contracts = await db
        .select({
          id: schema.proposals.id,
          proposalId: schema.proposals.id,
          clientId: schema.jobs.clientId,
          freelancerId: schema.proposals.freelancerId,
          jobId: schema.jobs.id,
          jobTitle: schema.jobs.title,
          jobDescription: schema.jobs.description,
          proposedRate: schema.proposals.proposedRate,
          estimatedDuration: schema.proposals.estimatedDuration,
          status: sql`'active'`,
          startDate: schema.proposals.updatedAt,
          coverLetter: schema.proposals.coverLetter,
          proposalStatus: schema.proposals.status,
          createdAt: schema.proposals.createdAt,
          updatedAt: schema.proposals.updatedAt
        })
        .from(schema.proposals)
        .leftJoin(schema.jobs, eq(schema.proposals.jobId, schema.jobs.id))
        .where(
          and(
            eq(schema.proposals.status, 'accepted'),
            userType === 'client' 
              ? eq(schema.jobs.clientId, userId)
              : eq(schema.proposals.freelancerId, userId)
          )
        )
        .orderBy(desc(schema.proposals.updatedAt));

      return contracts;
    } catch (error) {
      console.error('Error getting contracts:', error);
      throw error;
    }
  }
}

// Session-based authentication middleware
export const requireSessionAuth = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Verify user still exists
    const user = await dbService.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Session auth error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

// Login handler
export const handleLogin = async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await dbService.getUserByEmail(email);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is approved (treat null/undefined as approved for existing users)
    const approvalStatus = user.approvalStatus || 'approved';
    if (approvalStatus !== 'approved') {
      console.log('User not approved yet:', email, 'Status:', approvalStatus);
      return res.status(401).json({
        status: 'error',
        message: approvalStatus === 'pending' 
          ? 'Your account is pending admin approval. Please wait for approval before logging in.'
          : 'Your account has been rejected. Please contact support.'
      });
    }

    // Verify password
    console.log('Verifying password for user:', user.id);
    console.log('User password hash:', user.passwordHash ? 'exists' : 'missing');
    console.log('Provided password:', password);
    
    // Try multiple password verification methods
    let isValidPassword = false;
    
    // Method 1: Direct password comparison (for demo accounts)
    if (user.passwordHash === password) {
      console.log('Direct password match found');
      isValidPassword = true;
    } 
    // Method 2: bcrypt verification
    else if (user.passwordHash) {
      try {
        isValidPassword = await dbService.verifyPassword(password, user.passwordHash);
        console.log('Bcrypt verification result:', isValidPassword);
      } catch (verifyError) {
        console.error('Password verification error:', verifyError);
        isValidPassword = false;
      }
    }
    
    console.log('Final password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      role: user.userType,
      company: user.company,
      title: user.title
    };

    console.log('Session created for user:', user.id, 'Email:', user.email);

    // Update last login
    try {
      await dbService.updateUserLoginTime(user.id);
    } catch (loginTimeError) {
      console.error('Error updating login time:', loginTimeError);
      // Don't fail login if this fails
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.userType,
      userType: user.userType,
      company: user.company,
      title: user.title,
      bio: user.bio,
      skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
      hourlyRate: user.hourlyRate,
      location: user.location,
      phoneNumber: user.phoneNumber,
      website: user.website,
      rating: user.rating || 0,
      totalJobs: user.totalJobs || 0,
      completedJobs: user.completedJobs || 0,
      totalEarnings: user.totalEarnings || 0,
      createdAt: user.createdAt
    };

    console.log('Login successful for user:', user.email);
    res.json({
      status: 'success',
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Login error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Login failed: ' + error.message
    });
  }
};

// Logout handler
export const handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Logout failed'
      });
    }

    res.clearCookie('sessionId');
    res.json({
      status: 'success',
      message: 'Logout successful'
    });
  });
};

// Profile handler
export const handleProfile = async (req, res) => {
  try {
    console.log('Profile request - Session userId:', req.session?.userId);
    console.log('Profile request - Session user:', req.session?.user);
    
    if (!req.session?.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    const user = await dbService.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    console.log('Profile request successful for user:', user.email);
    
    res.json({
      status: 'success',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        company: user.company,
        title: user.title,
        bio: user.bio,
        skills: user.skills,
        hourlyRate: user.hourlyRate,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch profile'
    });
  }
};

// Job approval methods
DatabaseService.prototype.approveJob = async function(jobId, adminId) {
  try {
    console.log('Approving job:', jobId, 'by admin:', adminId);
    
    if (!db) {
      throw new Error('Database not initialized');
    }

    await db.update(schema.jobs)
      .set({
        approvalStatus: 'approved',
        approvedBy: adminId,
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(schema.jobs.id, jobId));

    console.log('Job approved successfully');
  } catch (error) {
    console.error('Error approving job:', error);
    throw error;
  }
};

DatabaseService.prototype.rejectJob = async function(jobId, adminId, reason) {
  try {
    console.log('Rejecting job:', jobId, 'by admin:', adminId);
    
    if (!db) {
      throw new Error('Database not initialized');
    }

    await db.update(schema.jobs)
      .set({
        approvalStatus: 'rejected',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date()
      })
      .where(eq(schema.jobs.id, jobId));

    console.log('Job rejected successfully');
  } catch (error) {
    console.error('Error rejecting job:', error);
    throw error;
  }
};

// Add missing methods to DatabaseService class
DatabaseService.prototype.getClientJobs = async function(clientId) {
  try {
    console.log('Fetching jobs for client:', clientId);
    
    if (!db) {
      throw new Error('Database not initialized');
    }

    const jobs = await db.query.jobs.findMany({
      where: (jobs, { eq }) => eq(jobs.clientId, clientId),
      with: {
        client: true,
      },
      orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
    });

    console.log(`Found ${jobs.length} jobs for client ${clientId}`);

    return jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      skills: this.parseSkills(job.skills),
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      budgetType: job.budgetType,
      experienceLevel: job.experienceLevel,
      duration: job.duration,
      status: job.status,
      approvalStatus: job.approvalStatus || 'approved',
      proposalCount: job.proposalCount || 0,
      createdAt: job.createdAt,
      clientId: job.clientId,
      clientName: job.client ? `${job.client.firstName} ${job.client.lastName}` : 'Unknown Client',
      clientCompany: job.client?.company,
      budget: this.calculateBudget(job)
    }));
  } catch (error) {
    console.error('Error fetching client jobs:', error);
    throw error;
  }
};

DatabaseService.prototype.getProjectById = async function(projectId) {
  try {
    console.log('Fetching project:', projectId);
    
    if (!db) {
      throw new Error('Database not initialized');
    }

    const project = await db.query.projects.findFirst({
      where: (projects, { eq }) => eq(projects.id, projectId),
      with: {
        client: true,
        freelancer: true,
      },
    });

    if (!project) {
      return null;
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      budget: project.budget,
      deadline: project.deadline,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      clientId: project.clientId,
      freelancerId: project.freelancerId,
      clientName: project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Unknown Client',
      freelancerName: project.freelancer ? `${project.freelancer.firstName} ${project.freelancer.lastName}` : 'Unknown Freelancer'
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

DatabaseService.prototype.getProjectTasks = async function(projectId) {
  try {
    console.log('Fetching tasks for project:', projectId);
    return [];
  } catch (error) {
    console.error('Error fetching project tasks:', error);
    return [];
  }
};

DatabaseService.prototype.getProjectMessages = async function(projectId) {
  try {
    console.log('Fetching messages for project:', projectId);
    return [];
  } catch (error) {
    console.error('Error fetching project messages:', error);
    return [];
  }
};

// Export singleton instance
const dbService = new DatabaseService();
export default dbService;