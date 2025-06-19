import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, sql, or, inArray } from 'drizzle-orm';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set!");
  console.error("Available environment variables:", Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('DB')));
  console.error("Please check your web.config file and ensure DATABASE_URL is configured correctly.");
  
  // Continue with a warning but don't crash the server
  console.warn("Server will continue but database operations will fail until DATABASE_URL is configured.");
}

export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = pool ? drizzle({ client: pool, schema }) : null;

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
        clientRating: job.client?.rating ? (job.client.rating / 10) : 0,
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
        clientRating: job.client?.rating ? (job.client.rating / 10) : 0,
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
      const [proposal] = await db.insert(schema.proposals).values({
        jobId: proposalData.jobId,
        freelancerId: proposalData.freelancerId,
        coverLetter: proposalData.coverLetter,
        proposedRate: proposalData.proposedRate,
        estimatedDuration: proposalData.estimatedDuration,
        status: proposalData.status || 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Update job proposal count
      await db.update(schema.jobs)
        .set({
          proposalCount: db.select({ count: sql`count(*)` })
            .from(schema.proposals)
            .where(eq(schema.proposals.jobId, proposalData.jobId))
        })
        .where(eq(schema.jobs.id, proposalData.jobId));

      return proposal;
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
}

// Export singleton instance
const dbService = new DatabaseService();
export default dbService;