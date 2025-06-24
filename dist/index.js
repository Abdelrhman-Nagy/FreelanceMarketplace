var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import crypto2 from "crypto";

// server/database.js
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, sql, or, inArray, desc } from "drizzle-orm";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import session from "express-session";

// shared/schema.js
var schema_exports = {};
__export(schema_exports, {
  contracts: () => contracts,
  contractsRelations: () => contractsRelations,
  insertContractSchema: () => insertContractSchema,
  insertJobSchema: () => insertJobSchema,
  insertProjectFileSchema: () => insertProjectFileSchema,
  insertProjectMemberSchema: () => insertProjectMemberSchema,
  insertProjectMessageSchema: () => insertProjectMessageSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertProposalSchema: () => insertProposalSchema,
  insertSavedJobSchema: () => insertSavedJobSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertUserSchema: () => insertUserSchema,
  jobs: () => jobs,
  jobsRelations: () => jobsRelations,
  passwordResetTokens: () => passwordResetTokens,
  passwordResetTokensRelations: () => passwordResetTokensRelations,
  projectFiles: () => projectFiles,
  projectFilesRelations: () => projectFilesRelations,
  projectMembers: () => projectMembers,
  projectMembersRelations: () => projectMembersRelations,
  projectMessages: () => projectMessages,
  projectMessagesRelations: () => projectMessagesRelations,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  proposals: () => proposals,
  proposalsRelations: () => proposalsRelations,
  savedJobs: () => savedJobs,
  savedJobsRelations: () => savedJobsRelations,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  userPermissions: () => userPermissions,
  userPermissionsRelations: () => userPermissionsRelations,
  userSessions: () => userSessions,
  userSessionsRelations: () => userSessionsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, integer, timestamp, boolean, jsonb, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  // hashed password for authentication
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  userType: text("user_type").notNull(),
  // 'admin', 'client', or 'freelancer'
  status: text("status").default("active"),
  // 'active', 'pending', 'suspended'
  company: text("company"),
  title: text("title"),
  bio: text("bio"),
  skills: jsonb("skills").default([]),
  hourlyRate: integer("hourly_rate"),
  location: text("location"),
  timezone: text("timezone"),
  phoneNumber: text("phone_number"),
  website: text("website"),
  portfolio: text("portfolio"),
  experience: text("experience"),
  // 'entry', 'intermediate', 'expert'
  rating: integer("rating").default(0),
  totalJobs: integer("total_jobs").default(0),
  completedJobs: integer("completed_jobs").default(0),
  totalEarnings: integer("total_earnings").default(0),
  profileImage: text("profile_image"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clientId: text("client_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  budgetType: text("budget_type").notNull(),
  // 'fixed' or 'hourly'
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  hourlyRate: integer("hourly_rate"),
  experienceLevel: text("experience_level").notNull(),
  skills: jsonb("skills").default([]),
  status: text("status").default("active"),
  remote: boolean("remote").default(false),
  duration: text("duration"),
  proposalCount: integer("proposal_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  freelancerId: text("freelancer_id").notNull().references(() => users.id),
  coverLetter: text("cover_letter").notNull(),
  proposedRate: integer("proposed_rate"),
  estimatedDuration: text("estimated_duration"),
  status: text("status").default("pending"),
  // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  jobsAsClient: many(jobs),
  proposals: many(proposals),
  sessions: many(userSessions),
  permissions: many(userPermissions),
  grantedPermissions: many(userPermissions, { relationName: "grantedBy" })
}));
var jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(users, {
    fields: [jobs.clientId],
    references: [users.id]
  }),
  proposals: many(proposals)
}));
var proposalsRelations = relations(proposals, ({ one }) => ({
  job: one(jobs, {
    fields: [proposals.jobId],
    references: [jobs.id]
  }),
  freelancer: one(users, {
    fields: [proposals.freelancerId],
    references: [users.id]
  })
}));
var userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var userPermissions = pgTable("user_permissions", {
  id: varchar("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  permission: varchar("permission").notNull(),
  resourceType: varchar("resource_type"),
  resourceId: varchar("resource_id"),
  granted: boolean("granted").default(true),
  grantedBy: text("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow()
});
var userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id]
  })
}));
var userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id]
  }),
  grantedByUser: one(users, {
    fields: [userPermissions.grantedBy],
    references: [users.id],
    relationName: "grantedBy"
  })
}));
var passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id]
  })
}));
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  clientId: text("client_id").notNull().references(() => users.id),
  freelancerId: text("freelancer_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  status: text("status").default("active"),
  deadline: timestamp("deadline"),
  budget: integer("budget"),
  // stored in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => proposals.id),
  clientId: text("client_id").notNull().references(() => users.id),
  freelancerId: text("freelancer_id").notNull().references(() => users.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  proposedRate: integer("proposed_rate"),
  estimatedDuration: text("estimated_duration"),
  status: text("status").default("active"),
  // active, completed, cancelled, disputed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  terms: text("terms"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: text("assigned_to").references(() => users.id),
  status: text("status").default("todo"),
  priority: text("priority").default("medium"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow()
});
var projectMessages = pgTable("project_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  senderId: text("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"),
  createdAt: timestamp("created_at").defaultNow()
});
var projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow()
});
var projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id]
  }),
  freelancer: one(users, {
    fields: [projects.freelancerId],
    references: [users.id]
  }),
  job: one(jobs, {
    fields: [projects.jobId],
    references: [jobs.id]
  }),
  tasks: many(tasks),
  files: many(projectFiles),
  messages: many(projectMessages),
  members: many(projectMembers)
}));
var tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id]
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id]
  })
}));
var projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id]
  }),
  uploader: one(users, {
    fields: [projectFiles.uploadedBy],
    references: [users.id]
  })
}));
var projectMessagesRelations = relations(projectMessages, ({ one }) => ({
  project: one(projects, {
    fields: [projectMessages.projectId],
    references: [projects.id]
  }),
  sender: one(users, {
    fields: [projectMessages.senderId],
    references: [users.id]
  })
}));
var projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id]
  })
}));
var contractsRelations = relations(contracts, ({ one }) => ({
  proposal: one(proposals, {
    fields: [contracts.proposalId],
    references: [proposals.id]
  }),
  client: one(users, {
    fields: [contracts.clientId],
    references: [users.id]
  }),
  freelancer: one(users, {
    fields: [contracts.freelancerId],
    references: [users.id]
  }),
  job: one(jobs, {
    fields: [contracts.jobId],
    references: [jobs.id]
  })
}));
var insertUserSchema = createInsertSchema(users);
var insertJobSchema = createInsertSchema(jobs);
var insertProposalSchema = createInsertSchema(proposals);
var insertProjectSchema = createInsertSchema(projects);
var insertTaskSchema = createInsertSchema(tasks);
var insertProjectFileSchema = createInsertSchema(projectFiles);
var insertProjectMessageSchema = createInsertSchema(projectMessages);
var insertProjectMemberSchema = createInsertSchema(projectMembers);
var savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  savedAt: timestamp("saved_at").defaultNow()
});
var savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(users, {
    fields: [savedJobs.userId],
    references: [users.id]
  }),
  job: one(jobs, {
    fields: [savedJobs.jobId],
    references: [jobs.id]
  })
}));
var insertSavedJobSchema = createInsertSchema(savedJobs);
var insertContractSchema = createInsertSchema(contracts);

// server/database.js
var { Pool } = pg;
var pool = null;
var db = null;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
    console.log("Database configuration successful");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
} else {
  console.log("DATABASE_URL not found in environment variables");
}
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
var SESSION_DURATION = 24 * 60 * 60 * 1e3;
var sessionConfig = session({
  secret: process.env.SESSION_SECRET || "freelance-platform-dev-secret-2024",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3,
    // 24 hours
    sameSite: "lax"
  },
  name: "sessionId"
});
var DatabaseService = class {
  constructor() {
    this.isConnected = true;
  }
  async testConnection() {
    if (!db) {
      return {
        status: "not_configured",
        database: "postgresql",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: "DATABASE_URL not configured",
        config: {}
      };
    }
    try {
      const result = await db.execute(sql`SELECT 1 as test`);
      console.log("Database connection test successful");
      return {
        status: "connected",
        database: "postgresql",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        config: {
          host: process.env.PGHOST || "localhost",
          database: process.env.PGDATABASE || "unknown",
          port: process.env.PGPORT || "5432",
          user: process.env.PGUSER || "unknown"
        }
      };
    } catch (error) {
      console.error("Database connection test failed:", error);
      console.error("Error details:", error.stack);
      try {
        if (process.env.DATABASE_URL && !pool) {
          console.log("Attempting to reconnect to database...");
          pool = new Pool({ connectionString: process.env.DATABASE_URL });
          db = drizzle({ client: pool, schema: schema_exports });
          console.log("Database reconnection successful");
        }
      } catch (reconnectError) {
        console.error("Reconnection failed:", reconnectError);
      }
      return {
        status: "failed",
        database: "postgresql",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        error: error.message,
        config: {}
      };
    }
  }
  async getJobs() {
    if (!db) {
      throw new Error("Database not configured. Please set DATABASE_URL in web.config");
    }
    try {
      console.log("Fetching jobs from database...");
      const { jobs: jobs2, users: users2 } = schema_exports;
      if (!db) {
        throw new Error("Database connection not available");
      }
      const allJobs = await db.select().from(jobs2);
      console.log(`Found ${allJobs.length} total jobs in database`);
      const jobsWithClients = await db.select({
        id: jobs2.id,
        title: jobs2.title,
        description: jobs2.description,
        category: jobs2.category,
        skills: jobs2.skills,
        budgetMin: jobs2.budgetMin,
        budgetMax: jobs2.budgetMax,
        budgetType: jobs2.budgetType,
        experienceLevel: jobs2.experienceLevel,
        duration: jobs2.duration,
        status: jobs2.status,
        proposalCount: jobs2.proposalCount,
        createdAt: jobs2.createdAt,
        clientId: jobs2.clientId,
        clientName: sql`${users2.firstName} || ' ' || ${users2.lastName}`.as("clientName"),
        clientCompany: users2.company,
        clientRating: users2.rating
      }).from(jobs2).leftJoin(users2, eq(jobs2.clientId, users2.id)).where(eq(jobs2.status, "active")).orderBy(jobs2.createdAt);
      console.log(`Filtered ${jobsWithClients.length} active jobs`);
      const result = jobsWithClients.map((job) => {
        console.log("Processing job:", job.id, job.title);
        return {
          ...job,
          skills: this.parseSkills(job.skills),
          budget: this.calculateBudget(job)
        };
      });
      console.log("Jobs processed successfully, final count:", result.length);
      console.log("Sample processed job:", result[0] ? JSON.stringify(result[0], null, 2) : "No processed jobs");
      return result;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      console.error("Error details:", error.stack);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
  }
  async getJobById(jobId) {
    if (!db) {
      throw new Error("Database not configured. Please set DATABASE_URL in web.config");
    }
    try {
      const { jobs: jobs2, users: users2 } = schema_exports;
      const [job] = await db.select({
        id: jobs2.id,
        title: jobs2.title,
        description: jobs2.description,
        category: jobs2.category,
        skills: jobs2.skills,
        budgetMin: jobs2.budgetMin,
        budgetMax: jobs2.budgetMax,
        budgetType: jobs2.budgetType,
        experienceLevel: jobs2.experienceLevel,
        duration: jobs2.duration,
        status: jobs2.status,
        proposalCount: jobs2.proposalCount,
        createdAt: jobs2.createdAt,
        clientId: jobs2.clientId,
        clientName: sql`${users2.firstName} || ' ' || ${users2.lastName}`.as("clientName"),
        clientCompany: users2.company,
        clientRating: users2.rating
      }).from(jobs2).leftJoin(users2, eq(jobs2.clientId, users2.id)).where(eq(jobs2.id, parseInt(jobId)));
      if (!job) {
        return null;
      }
      return {
        ...job,
        skills: this.parseSkills(job.skills),
        budget: this.calculateBudget(job)
      };
    } catch (error) {
      console.error("Error fetching job by ID:", error);
      throw new Error(`Failed to fetch job: ${error.message}`);
    }
  }
  async getUserStats(userId) {
    try {
      const user = await db.query.users.findFirst({
        where: (users2, { eq: eq2 }) => eq2(users2.id, userId)
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
      const activeJobs = await db.query.jobs.findMany({
        where: (jobs2, { eq: eq2, and: and2 }) => and2(
          eq2(jobs2.clientId, userId),
          eq2(jobs2.status, "active")
        )
      });
      const proposals2 = await db.query.proposals.findMany({
        where: (proposals3, { eq: eq2 }) => eq2(proposals3.freelancerId, userId)
      });
      return {
        totalJobs: user.totalJobs || 0,
        activeJobs: activeJobs.length,
        activeProposals: proposals2.filter((p) => p.status === "pending").length,
        completedContracts: proposals2.filter((p) => p.status === "accepted").length,
        totalEarnings: 12500,
        // This would come from a contracts/payments table
        rating: user.rating ? user.rating / 10 : 0
      };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }
  // Helper methods
  calculateBudget(job) {
    try {
      if (job.budgetType === "fixed") {
        if (job.budgetMin && job.budgetMax) {
          return `$${job.budgetMin} - $${job.budgetMax}`;
        } else if (job.budgetMin) {
          return `$${job.budgetMin}`;
        }
        return "Budget not specified";
      } else if (job.budgetType === "hourly") {
        return job.hourlyRate ? `$${job.hourlyRate}/hour` : "Rate not specified";
      }
      return "Budget not specified";
    } catch (error) {
      console.error("Error calculating budget:", error);
      return "Budget not specified";
    }
  }
  parseSkills(skillsString) {
    try {
      if (!skillsString) return [];
      if (Array.isArray(skillsString)) return skillsString;
      if (typeof skillsString === "string") {
        try {
          return JSON.parse(skillsString);
        } catch {
          return skillsString.split(",").map((s) => s.trim());
        }
      }
      return Array.isArray(skillsString) ? skillsString : [];
    } catch (error) {
      console.error("Error parsing skills:", error);
      return [];
    }
  }
  // Project Management Methods
  async getUserProjects(userId, userType) {
    try {
      let whereClause;
      if (userType === "client") {
        whereClause = (projects3, { eq: eq2 }) => eq2(projects3.clientId, userId);
      } else if (userType === "freelancer") {
        whereClause = (projects3, { eq: eq2, or: or2 }) => or2(
          eq2(projects3.freelancerId, userId)
          // Also include projects where user is a member
        );
      } else {
        whereClause = void 0;
      }
      const projects2 = await db.query.projects.findMany({
        where: whereClause,
        with: {
          client: true,
          freelancer: true,
          job: true,
          members: {
            with: {
              user: true
            }
          }
        },
        orderBy: (projects3, { desc: desc2 }) => [desc2(projects3.updatedAt)]
      });
      let additionalProjects = [];
      if (userType === "freelancer") {
        const memberProjects = await db.query.projects.findMany({
          where: (projects3, { eq: eq2, and: and2, inArray: inArray2 }) => and2(
            inArray2(
              projects3.id,
              db.select({ projectId: projectMembers.projectId }).from(projectMembers).where(eq2(projectMembers.userId, userId))
            )
          ),
          with: {
            client: true,
            freelancer: true,
            job: true,
            members: {
              with: {
                user: true
              }
            }
          }
        });
        additionalProjects = memberProjects.filter(
          (mp) => !projects2.some((p) => p.id === mp.id)
        );
      }
      const allProjects = [...projects2, ...additionalProjects];
      return allProjects.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        clientId: project.clientId,
        clientName: project.client ? `${project.client.firstName} ${project.client.lastName}` : "Unknown Client",
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
      console.error("Error fetching user projects:", error);
      throw error;
    }
  }
  getUserProjectRole(project, userId) {
    if (project.clientId === userId) return "client";
    if (project.freelancerId === userId) return "freelancer";
    const member = project.members?.find((m) => m.userId === userId);
    return member ? member.role : "viewer";
  }
  async getProjectById(projectId) {
    try {
      const project = await db.query.projects.findFirst({
        where: (projects2, { eq: eq2 }) => eq2(projects2.id, projectId),
        with: {
          client: true,
          freelancer: true,
          job: true,
          members: {
            with: {
              user: true
            }
          }
        }
      });
      if (!project) {
        return null;
      }
      return {
        id: project.id,
        title: project.title,
        description: project.description,
        clientId: project.clientId,
        clientName: project.client ? `${project.client.firstName} ${project.client.lastName}` : "Unknown Client",
        freelancerId: project.freelancerId,
        freelancerName: project.freelancer ? `${project.freelancer.firstName} ${project.freelancer.lastName}` : null,
        jobId: project.jobId,
        jobTitle: project.job?.title,
        status: project.status,
        deadline: project.deadline,
        budget: project.budget ? project.budget / 100 : 0,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        members: project.members.map((member) => ({
          id: member.id,
          userId: member.userId,
          userName: `${member.user.firstName} ${member.user.lastName}`,
          userEmail: member.user.email,
          role: member.role,
          joinedAt: member.joinedAt
        }))
      };
    } catch (error) {
      console.error("Error fetching project by ID:", error);
      throw error;
    }
  }
  async getProjectTasks(projectId) {
    try {
      const tasks2 = await db.query.tasks.findMany({
        where: (tasks3, { eq: eq2 }) => eq2(tasks3.projectId, projectId),
        with: {
          assignee: true
        },
        orderBy: (tasks3, { asc }) => [asc(tasks3.dueDate)]
      });
      return tasks2.map((task) => ({
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
      console.error("Error fetching project tasks:", error);
      throw error;
    }
  }
  async getProjectMessages(projectId) {
    try {
      const messages = await db.query.projectMessages.findMany({
        where: (messages2, { eq: eq2 }) => eq2(messages2.projectId, projectId),
        with: {
          sender: true
        },
        orderBy: (messages2, { asc }) => [asc(messages2.createdAt)]
      });
      return messages.map((message) => ({
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
      console.error("Error fetching project messages:", error);
      throw error;
    }
  }
  async createProjectMessage(messageData) {
    try {
      const [message] = await db.insert(projectMessages).values({
        projectId: messageData.projectId,
        senderId: messageData.senderId,
        message: messageData.message,
        messageType: messageData.messageType || "text",
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      const sender = await db.query.users.findFirst({
        where: (users2, { eq: eq2 }) => eq2(users2.id, messageData.senderId)
      });
      return {
        id: message.id,
        projectId: message.projectId,
        senderId: message.senderId,
        senderName: sender ? `${sender.firstName} ${sender.lastName}` : "Unknown User",
        senderEmail: sender?.email,
        message: message.message,
        messageType: message.messageType,
        createdAt: message.createdAt
      };
    } catch (error) {
      console.error("Error creating project message:", error);
      throw error;
    }
  }
  async createTask(taskData) {
    try {
      const [task] = await db.insert(tasks).values({
        projectId: taskData.projectId,
        title: taskData.title,
        description: taskData.description,
        assignedTo: taskData.assignedTo,
        status: taskData.status || "todo",
        priority: taskData.priority || "medium",
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning();
      let assigneeName = null;
      if (task.assignedTo) {
        const assignee = await db.query.users.findFirst({
          where: (users2, { eq: eq2 }) => eq2(users2.id, task.assignedTo)
        });
        assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null;
      }
      return {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        assigneeName,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }
  async updateTask(taskId, updates) {
    try {
      const [task] = await db.update(tasks).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(tasks.id, taskId)).returning();
      let assigneeName = null;
      if (task.assignedTo) {
        const assignee = await db.query.users.findFirst({
          where: (users2, { eq: eq2 }) => eq2(users2.id, task.assignedTo)
        });
        assigneeName = assignee ? `${assignee.firstName} ${assignee.lastName}` : null;
      }
      return {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        assigneeName,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      };
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }
  // Proposals Management
  async createProposal(proposalData) {
    try {
      console.log("Creating proposal with data:", proposalData);
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
        proposalData.status || "pending"
      ];
      const result = await pool.query(query, values);
      console.log("Proposal created successfully:", result.rows[0]);
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
      console.error("Error creating proposal:", error);
      throw error;
    }
  }
  async getUserProposals(userId) {
    try {
      const proposals2 = await db.query.proposals.findMany({
        where: (proposals3, { eq: eq2 }) => eq2(proposals3.freelancerId, userId),
        with: {
          job: {
            with: {
              client: true
            }
          }
        },
        orderBy: (proposals3, { desc: desc2 }) => [desc2(proposals3.createdAt)]
      });
      return proposals2.map((proposal) => ({
        id: proposal.id,
        jobId: proposal.jobId,
        jobTitle: proposal.job.title,
        clientName: proposal.job.client ? `${proposal.job.client.firstName} ${proposal.job.client.lastName}` : "Unknown Client",
        coverLetter: proposal.coverLetter,
        proposedRate: proposal.proposedRate,
        estimatedDuration: proposal.estimatedDuration,
        status: proposal.status,
        createdAt: proposal.createdAt,
        updatedAt: proposal.updatedAt
      }));
    } catch (error) {
      console.error("Error fetching user proposals:", error);
      throw error;
    }
  }
  // Saved Jobs Management
  async saveJob(userId, jobId) {
    try {
      const [savedJob] = await db.insert(savedJobs).values({
        userId,
        jobId,
        savedAt: /* @__PURE__ */ new Date()
      }).returning();
      return savedJob;
    } catch (error) {
      if (error.code === "23505") {
        throw new Error("Job is already saved");
      }
      console.error("Error saving job:", error);
      throw error;
    }
  }
  async unsaveJob(userId, jobId) {
    try {
      await db.delete(savedJobs).where(and(
        eq(savedJobs.userId, userId),
        eq(savedJobs.jobId, jobId)
      ));
    } catch (error) {
      console.error("Error unsaving job:", error);
      throw error;
    }
  }
  async getSavedJobs(userId) {
    try {
      const savedJobs2 = await db.query.savedJobs.findMany({
        where: (savedJobs3, { eq: eq2 }) => eq2(savedJobs3.userId, userId),
        with: {
          job: {
            with: {
              client: true
            }
          }
        },
        orderBy: (savedJobs3, { desc: desc2 }) => [desc2(savedJobs3.savedAt)]
      });
      return savedJobs2.map((saved) => ({
        id: saved.id,
        jobId: saved.job.id,
        jobTitle: saved.job.title,
        jobDescription: saved.job.description,
        budget: this.calculateBudget(saved.job),
        category: saved.job.category,
        clientName: saved.job.client ? `${saved.job.client.firstName} ${saved.job.client.lastName}` : "Unknown Client",
        clientCompany: saved.job.client?.company,
        savedAt: saved.savedAt
      }));
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      throw error;
    }
  }
  // Get proposals for a specific job (client access)
  async getJobProposals(jobId) {
    try {
      const proposals2 = await db.query.proposals.findMany({
        where: (proposals3, { eq: eq2 }) => eq2(proposals3.jobId, jobId),
        with: {
          freelancer: true
        },
        orderBy: (proposals3, { desc: desc2 }) => [desc2(proposals3.createdAt)]
      });
      return proposals2.map((proposal) => ({
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
      console.error("Error fetching job proposals:", error);
      throw error;
    }
  }
  // Update proposal status (client only)
  async updateProposalStatus(proposalId, status, clientId) {
    try {
      const proposal = await db.query.proposals.findFirst({
        where: (proposals2, { eq: eq2 }) => eq2(proposals2.id, proposalId),
        with: {
          job: true
        }
      });
      if (!proposal || proposal.job.clientId !== clientId) {
        throw new Error("Access denied: You can only update proposals for your own jobs");
      }
      const [updatedProposal] = await db.update(proposals).set({
        status,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(proposals.id, proposalId)).returning();
      return updatedProposal;
    } catch (error) {
      console.error("Error updating proposal status:", error);
      throw error;
    }
  }
  // User management methods
  async getUserByEmail(email) {
    try {
      if (!db) {
        console.error("Database not initialized - check DATABASE_URL in web.config");
        throw new Error("Database not initialized");
      }
      console.log("Searching for user with email:", email);
      const users2 = await db.select().from(users).where(eq(users.email, email)).limit(1);
      console.log("Database query result count:", users2.length);
      if (users2.length > 0) {
        console.log("User found:", users2[0].id, users2[0].email);
        return users2[0];
      } else {
        console.log("No user found with email:", email);
        return null;
      }
    } catch (error) {
      console.error("Error getting user by email:", error);
      console.error("Database error details:", error.message);
      throw error;
    }
  }
  async getUserById(userId) {
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }
      const users2 = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      return users2.length > 0 ? users2[0] : null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }
  async createUser(userData) {
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }
      const result = await db.insert(users).values(userData).returning();
      console.log("User created successfully:", result[0].id);
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  async updateUser(userId, updates) {
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }
      const result = await db.update(users).set({
        ...updates,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(users.id, userId)).returning();
      if (result.length === 0) {
        throw new Error("User not found");
      }
      console.log("User updated successfully:", userId);
      return result[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
  async createUserSession(sessionData) {
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }
      const result = await db.insert(userSessions).values(sessionData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user session:", error);
      throw error;
    }
  }
  async updateUserLoginTime(userId) {
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }
      await db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating user login time:", error);
      throw error;
    }
  }
  async createJob(jobData) {
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }
      const [newJob] = await db.insert(jobs).values(jobData).returning();
      console.log("Job created successfully:", newJob.id);
      return newJob;
    } catch (error) {
      console.error("Error creating job:", error);
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
      { expiresIn: "24h" }
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
    if (!hashedPassword || typeof hashedPassword !== "string") {
      console.log("Invalid hashed password provided:", typeof hashedPassword);
      return false;
    }
    if (!password || typeof password !== "string") {
      console.log("Invalid password provided:", typeof password);
      return false;
    }
    try {
      console.log("Comparing password with hash...");
      const result = await bcrypt.compare(password, hashedPassword);
      console.log("Password comparison result:", result);
      return result;
    } catch (error) {
      console.error("Password verification error:", error);
      console.error("Password verification error details:", error.message);
      return false;
    }
  }
  async createSession(userId) {
    const sessionId = crypto.randomUUID();
    const token = crypto.randomBytes(64).toString("hex");
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
      console.error("Session validation error:", error);
      return null;
    }
  }
  async deleteSession(token) {
    try {
      const query = "DELETE FROM user_sessions WHERE token = $1";
      await pool.query(query, [token]);
      return true;
    } catch (error) {
      console.error("Session deletion error:", error);
      return false;
    }
  }
  async getUserStatistics(userId, userType) {
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }
      if (userType === "client") {
        const jobsStats = await db.select({
          totalJobs: sql`COUNT(*)`,
          activeJobs: sql`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
          totalSpent: sql`SUM(CASE WHEN budget_min IS NOT NULL AND budget_max IS NOT NULL THEN (budget_min + budget_max) / 2 ELSE 0 END)`
        }).from(jobs).where(eq(jobs.clientId, userId));
        return {
          totalJobsPosted: Number(jobsStats[0]?.totalJobs) || 0,
          activeJobs: Number(jobsStats[0]?.activeJobs) || 0,
          totalSpent: Number(jobsStats[0]?.totalSpent) || 0,
          memberSince: null
          // Will be set from user creation date
        };
      } else {
        const proposalsStats = await db.select({
          totalProposals: sql`COUNT(*)`,
          acceptedProposals: sql`SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END)`,
          pendingProposals: sql`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`
        }).from(proposals).where(eq(proposals.freelancerId, userId));
        const savedJobsStats = await db.select({
          savedJobsCount: sql`COUNT(*)`
        }).from(savedJobs).where(eq(savedJobs.userId, userId));
        return {
          totalProposals: Number(proposalsStats[0]?.totalProposals) || 0,
          acceptedProposals: Number(proposalsStats[0]?.acceptedProposals) || 0,
          pendingProposals: Number(proposalsStats[0]?.pendingProposals) || 0,
          savedJobs: Number(savedJobsStats[0]?.savedJobsCount) || 0,
          totalEarnings: 0,
          // This would come from completed projects/contracts
          memberSince: null
          // Will be set from user creation date
        };
      }
    } catch (error) {
      console.error("Error getting user statistics:", error);
      throw error;
    }
  }
  async getContracts(userId, userType) {
    try {
      if (!db) {
        throw new Error("Database not initialized");
      }
      const contracts2 = await db.select({
        id: proposals.id,
        proposalId: proposals.id,
        clientId: jobs.clientId,
        freelancerId: proposals.freelancerId,
        jobId: jobs.id,
        jobTitle: jobs.title,
        jobDescription: jobs.description,
        proposedRate: proposals.proposedRate,
        estimatedDuration: proposals.estimatedDuration,
        status: sql`'active'`,
        startDate: proposals.updatedAt,
        coverLetter: proposals.coverLetter,
        proposalStatus: proposals.status,
        createdAt: proposals.createdAt,
        updatedAt: proposals.updatedAt
      }).from(proposals).leftJoin(jobs, eq(proposals.jobId, jobs.id)).where(
        and(
          eq(proposals.status, "accepted"),
          userType === "client" ? eq(jobs.clientId, userId) : eq(proposals.freelancerId, userId)
        )
      ).orderBy(desc(proposals.updatedAt));
      return contracts2;
    } catch (error) {
      console.error("Error getting contracts:", error);
      throw error;
    }
  }
};
var requireSessionAuth = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const user = await dbService.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {
      });
      return res.status(401).json({
        status: "error",
        message: "User not found"
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Session auth error:", error);
    res.status(401).json({
      status: "error",
      message: "Authentication failed"
    });
  }
};
var handleLogin = async (req, res) => {
  try {
    console.log("Login attempt for:", req.body.email);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({
        status: "error",
        message: "Email and password are required"
      });
    }
    const user = await dbService.getUserByEmail(email);
    console.log("User found:", user ? "Yes" : "No");
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }
    console.log("Verifying password for user:", user.id);
    const isValidPassword = await dbService.verifyPassword(password, user.passwordHash);
    console.log("Password valid:", isValidPassword);
    if (!isValidPassword) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials"
      });
    }
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
    console.log("Session created for user:", user.id, "Email:", user.email);
    try {
      await dbService.updateUserLoginTime(user.id);
    } catch (loginTimeError) {
      console.error("Error updating login time:", loginTimeError);
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
      skills: user.skills ? typeof user.skills === "string" ? JSON.parse(user.skills) : user.skills : [],
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
    console.log("Login successful for user:", user.email);
    res.json({
      status: "success",
      message: "Login successful",
      user: userResponse
    });
  } catch (error) {
    console.error("Login error details:", error);
    console.error("Login error stack:", error.stack);
    res.status(500).json({
      status: "error",
      message: "Login failed: " + error.message
    });
  }
};
var handleLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        status: "error",
        message: "Logout failed"
      });
    }
    res.clearCookie("sessionId");
    res.json({
      status: "success",
      message: "Logout successful"
    });
  });
};
var handleProfile = async (req, res) => {
  try {
    console.log("Profile request - Session userId:", req.session?.userId);
    console.log("Profile request - Session user:", req.session?.user);
    if (!req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated"
      });
    }
    const user = await dbService.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    console.log("Profile request successful for user:", user.email);
    res.json({
      status: "success",
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
    console.error("Profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch profile"
    });
  }
};
var dbService = new DatabaseService();
var database_default = dbService;

// server/index.js
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT || process.env.IISNODE_PORT || 5e3;
var HOST = process.env.HOST || "0.0.0.0";
app.use(express.json());
app.use(cookieParser());
app.use(sessionConfig);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/test", async (req, res) => {
  try {
    const testConnection = await database_default.testConnection();
    res.json({
      status: "success",
      message: "API is working correctly",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      server: "Node.js Express",
      environment: process.env.NODE_ENV || "development",
      database: testConnection.status,
      config: testConnection.config || {}
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "API working but database connection failed",
      error: error.message,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      server: "Node.js Express",
      environment: process.env.NODE_ENV || "development"
    });
  }
});
app.get("/api/jobs", async (req, res) => {
  try {
    console.log("Jobs endpoint called");
    const jobs2 = await database_default.getJobs();
    console.log("Jobs retrieved, count:", jobs2.length);
    res.json({
      jobs: jobs2,
      total: jobs2.length,
      status: "success",
      database: "Connected to PostgreSQL"
    });
  } catch (error) {
    console.error("Jobs endpoint error:", error);
    console.error("Error stack:", error.stack);
    res.json({
      error: error.message,
      jobs: [],
      total: 0,
      status: "error",
      database: "Error occurred"
    });
  }
});
app.post("/api/jobs", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== "client") {
      return res.status(403).json({
        status: "error",
        message: "Only clients can post jobs"
      });
    }
    const {
      title,
      description,
      category,
      budgetType,
      budgetMin,
      budgetMax,
      experienceLevel,
      skills,
      duration
    } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({
        status: "error",
        message: "Title, description, and category are required"
      });
    }
    const jobData = {
      title,
      description,
      clientId: userId,
      category,
      budgetType: budgetType || "fixed",
      budgetMin: budgetMin ? parseInt(budgetMin) : null,
      budgetMax: budgetMax ? parseInt(budgetMax) : null,
      experienceLevel: experienceLevel || "Intermediate",
      skills: Array.isArray(skills) ? JSON.stringify(skills) : skills,
      duration,
      status: "active",
      createdAt: /* @__PURE__ */ new Date()
    };
    const newJob = await database_default.createJob(jobData);
    res.json({
      status: "success",
      message: "Job posted successfully",
      job: newJob
    });
  } catch (error) {
    console.error("Job creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create job"
    });
  }
});
app.get("/api/jobs/:id", async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const job = await database_default.getJobById(jobId);
    if (!job) {
      return res.status(404).json({
        error: "Job not found",
        status: "error"
      });
    }
    res.json({
      job,
      status: "success"
    });
  } catch (error) {
    console.error("Job detail endpoint error:", error);
    res.json({
      error: error.message,
      status: "error"
    });
  }
});
app.post("/api/proposals", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== "freelancer") {
      return res.status(403).json({
        status: "error",
        message: "Only freelancers can submit proposals"
      });
    }
    const { jobId, coverLetter, proposedRate, estimatedDuration } = req.body;
    if (!jobId || !coverLetter) {
      return res.status(400).json({
        status: "error",
        message: "Job ID and cover letter are required"
      });
    }
    console.log("Creating proposal with data:", {
      freelancerId: userId,
      jobId: parseInt(jobId),
      coverLetter,
      proposedRate: proposedRate ? parseInt(proposedRate) : null,
      estimatedDuration,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    });
    const proposalData = {
      freelancerId: userId,
      jobId: parseInt(jobId),
      coverLetter,
      proposedRate: proposedRate ? parseInt(proposedRate) : null,
      estimatedDuration,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    const newProposal = await database_default.createProposal(proposalData);
    console.log("Proposal created successfully:", newProposal);
    res.json({
      status: "success",
      message: "Proposal submitted successfully",
      proposal: newProposal
    });
  } catch (error) {
    console.error("Proposal creation error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to submit proposal"
    });
  }
});
app.get("/api/proposals/user", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const proposals2 = await database_default.getUserProposals(userId);
    res.json({
      status: "success",
      proposals: proposals2
    });
  } catch (error) {
    console.error("Error fetching user proposals:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch proposals"
    });
  }
});
app.get("/api/jobs/:id/proposals", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const jobId = parseInt(req.params.id);
    const proposals2 = await database_default.getJobProposals(jobId);
    res.json({
      status: "success",
      proposals: proposals2
    });
  } catch (error) {
    console.error("Error fetching job proposals:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch proposals"
    });
  }
});
app.patch("/api/proposals/:id/status", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const proposalId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== "client") {
      return res.status(403).json({
        status: "error",
        message: "Only clients can update proposal status"
      });
    }
    console.log(`Updating proposal ${proposalId} status to: ${status} by client: ${userId}`);
    const result = await database_default.updateProposalStatus(proposalId, status, userId);
    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Proposal not found or unauthorized"
      });
    }
    if (status === "accepted") {
      try {
        const contract = await database_default.createContract({
          proposalId,
          clientId: userId,
          freelancerId: result.freelancerId,
          jobId: result.jobId,
          proposedRate: result.proposedRate,
          estimatedDuration: result.estimatedDuration,
          status: "active",
          startDate: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log("Contract created:", contract);
        res.json({
          status: "success",
          message: "Proposal accepted and contract created successfully",
          proposal: result,
          contract
        });
      } catch (contractError) {
        console.error("Error creating contract:", contractError);
        res.json({
          status: "success",
          message: "Proposal accepted but contract creation failed",
          proposal: result,
          contractError: contractError.message
        });
      }
    } else {
      res.json({
        status: "success",
        message: `Proposal ${status} successfully`,
        proposal: result
      });
    }
  } catch (error) {
    console.error("Error updating proposal status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update proposal status"
    });
  }
});
app.get("/api/contracts", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    console.log(`Getting contracts for ${userType}: ${userId}`);
    const contracts2 = await database_default.getContracts(userId, userType);
    res.json({ contracts: contracts2, success: true });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch contracts"
    });
  }
});
app.post("/api/saved-jobs", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({
        status: "error",
        message: "Job ID is required"
      });
    }
    await database_default.saveJob(userId, parseInt(jobId));
    res.json({
      status: "success",
      message: "Job saved successfully"
    });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to save job"
    });
  }
});
app.get("/api/saved-jobs", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const savedJobs2 = await database_default.getSavedJobs(userId);
    res.json({
      status: "success",
      savedJobs: savedJobs2
    });
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch saved jobs"
    });
  }
});
app.get("/api/saved-jobs", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const savedJobs2 = await database_default.getSavedJobs(req.session.userId);
    res.json({
      status: "success",
      savedJobs: savedJobs2,
      total: savedJobs2.length
    });
  } catch (error) {
    console.error("Saved jobs fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch saved jobs"
    });
  }
});
app.post("/api/saved-jobs", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const { jobId } = req.body;
    await database_default.saveJob(req.session.userId, jobId);
    res.status(201).json({
      status: "success",
      message: "Job saved successfully"
    });
  } catch (error) {
    console.error("Save job error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to save job"
    });
  }
});
app.delete("/api/saved-jobs/:jobId", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const { jobId } = req.params;
    await database_default.unsaveJob(req.session.userId, parseInt(jobId));
    res.json({
      status: "success",
      message: "Job unsaved successfully"
    });
  } catch (error) {
    console.error("Unsave job error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to unsave job"
    });
  }
});
app.get("/api/contracts", async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const user = await database_default.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    const contracts2 = await database_default.getUserContracts(req.session.userId, user.userType);
    res.json({
      success: true,
      contracts: contracts2
    });
  } catch (error) {
    console.error("Contracts fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contracts"
    });
  }
});
app.get("/api/projects", async (req, res) => {
  try {
    const userId = req.query.userId || "freelancer_001";
    const userType = req.query.userType || "freelancer";
    const projects2 = await database_default.getUserProjects(userId, userType);
    res.json({
      projects: projects2,
      total: projects2.length,
      status: "success"
    });
  } catch (error) {
    console.error("Projects endpoint error:", error);
    res.json({
      error: error.message,
      projects: [],
      total: 0,
      status: "error"
    });
  }
});
app.get("/api/proposals", async (req, res) => {
  try {
    const userId = req.query.userId || "freelancer_001";
    const proposals2 = await database_default.getUserProposals(userId);
    res.json({
      proposals: proposals2,
      total: proposals2.length,
      status: "success"
    });
  } catch (error) {
    console.error("Proposals endpoint error:", error);
    res.json({
      error: error.message,
      proposals: [],
      total: 0,
      status: "error"
    });
  }
});
app.use(express.static("dist"));
app.get("/api/admin/stats", async (req, res) => {
  try {
    if (!req.session?.user || req.session.user.userType !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required"
      });
    }
    const totalUsers = await database_default.getTotalUsers();
    const usersByStatus = await database_default.getUsersByStatus();
    const jobStats = await database_default.getJobStatistics();
    res.json({
      status: "success",
      stats: {
        totalUsers: totalUsers.count,
        activeUsers: usersByStatus.active,
        pendingUsers: usersByStatus.pending,
        totalJobs: jobStats.total,
        activeJobs: jobStats.active,
        totalRevenue: 0,
        // TODO: Implement revenue tracking
        monthlyGrowth: 15
        // TODO: Calculate actual growth
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch admin statistics"
    });
  }
});
app.get("/api/admin/users", async (req, res) => {
  try {
    if (!req.session?.user || req.session.user.userType !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required"
      });
    }
    const users2 = await database_default.getAllUsersForAdmin();
    res.json({
      status: "success",
      users: users2
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch users"
    });
  }
});
app.put("/api/admin/users/:id", async (req, res) => {
  try {
    if (!req.session?.user || req.session.user.userType !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required"
      });
    }
    const userId = req.params.id;
    const updates = req.body;
    const updatedUser = await database_default.updateUser(userId, updates);
    res.json({
      status: "success",
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update user"
    });
  }
});
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    if (!req.session?.user || req.session.user.userType !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required"
      });
    }
    const userId = req.params.id;
    await database_default.deleteUser(userId);
    res.json({
      status: "success",
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Admin user delete error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete user"
    });
  }
});
app.get("/api", (req, res) => {
  res.json({
    message: "FreelancingPlatform API",
    status: "running",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    server: "Express.js",
    endpoints: [
      "GET /api/test",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/logout",
      "GET /api/auth/profile",
      "GET /api/jobs",
      "GET /api/jobs/:id",
      "GET /api/projects",
      "GET /api/proposals",
      "GET /api/admin/users",
      "GET /api/admin/stats",
      "PUT /api/admin/users/:id",
      "DELETE /api/admin/users/:id"
    ]
  });
});
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, company, title, bio, skills, hourlyRate, location, experience } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        status: "error",
        message: "Email, password, first name, and last name are required"
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password must be at least 6 characters long"
      });
    }
    const existingUser = await database_default.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User with this email already exists"
      });
    }
    const passwordHash = await database_default.hashPassword(password);
    const userData = {
      id: crypto2.randomUUID(),
      email,
      passwordHash,
      firstName,
      lastName,
      userType: role || "freelancer",
      company,
      title,
      bio,
      skills: Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify(skills || []),
      hourlyRate,
      location,
      experience,
      createdAt: /* @__PURE__ */ new Date()
    };
    const user = await database_default.createUser(userData);
    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      company: user.company,
      title: user.title
    };
    console.log("Session created for user:", user.id, "Email:", user.email);
    res.status(201).json({
      status: "success",
      message: "User registered and logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        company: user.company,
        title: user.title
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Registration failed"
    });
  }
});
app.post("/api/auth/login", handleLogin);
app.post("/api/auth/logout", handleLogout);
app.get("/api/auth/profile", handleProfile);
app.get("/api/auth/statistics", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    if (!userType) {
      return res.status(400).json({
        status: "error",
        message: "User type not found"
      });
    }
    const statistics = await database_default.getUserStatistics(userId, userType);
    const user = await database_default.getUserById(userId);
    const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    }) : "Unknown";
    res.json({
      status: "success",
      statistics: {
        ...statistics,
        memberSince,
        userType
      }
    });
  } catch (error) {
    console.error("Statistics fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch statistics"
    });
  }
});
app.put("/api/auth/profile", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const {
      firstName,
      lastName,
      company,
      bio,
      skills,
      hourlyRate,
      location,
      phoneNumber,
      website,
      experience
    } = req.body;
    const updates = {
      firstName,
      lastName,
      company,
      bio,
      skills,
      hourlyRate,
      location,
      phoneNumber,
      website,
      experience,
      updatedAt: /* @__PURE__ */ new Date()
    };
    Object.keys(updates).forEach((key) => {
      if (updates[key] === void 0) {
        delete updates[key];
      }
    });
    const updatedUser = await database_default.updateUser(userId, updates);
    const userData = {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      userType: updatedUser.userType,
      role: updatedUser.userType,
      company: updatedUser.company,
      title: updatedUser.title,
      bio: updatedUser.bio,
      skills: updatedUser.skills ? typeof updatedUser.skills === "string" ? JSON.parse(updatedUser.skills) : updatedUser.skills : [],
      hourlyRate: updatedUser.hourlyRate,
      location: updatedUser.location,
      phoneNumber: updatedUser.phoneNumber,
      website: updatedUser.website,
      rating: updatedUser.rating || 0,
      totalJobs: updatedUser.totalJobs || 0,
      completedJobs: updatedUser.completedJobs || 0,
      totalEarnings: updatedUser.totalEarnings || 0,
      createdAt: updatedUser.createdAt
    };
    req.session.user = userData;
    res.json({
      status: "success",
      message: "Profile updated successfully",
      user: userData
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update profile"
    });
  }
});
app.get("/api/admin/users", requireSessionAuth, async (req, res) => {
  try {
    const { role, status, limit } = req.query;
    const filters = { role, status, limit: limit ? parseInt(limit) : null };
    const users2 = await database_default.getAllUsers(filters);
    res.json({
      status: "success",
      users: users2,
      total: users2.length
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch users"
    });
  }
});
app.get("/api/admin/stats", requireSessionAuth, async (req, res) => {
  try {
    const userStats = await database_default.getUserStats();
    const jobStats = await database_default.getJobs();
    const proposalStats = await database_default.getAllProposals();
    const stats = {
      users: {
        total: userStats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
        byRole: userStats.reduce((acc, stat) => {
          if (!acc[stat.role]) acc[stat.role] = {};
          acc[stat.role][stat.status] = parseInt(stat.count);
          return acc;
        }, {})
      },
      jobs: {
        total: jobStats.length,
        active: jobStats.filter((job) => job.status === "active").length
      },
      proposals: {
        total: proposalStats.length
      }
    };
    res.json({
      status: "success",
      stats
    });
  } catch (error) {
    console.error("Admin stats fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch statistics"
    });
  }
});
app.get("/api/dashboard/:role", requireSessionAuth, async (req, res) => {
  try {
    const { role } = req.params;
    const user = req.user;
    if (user.user_type !== role && user.user_type !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied"
      });
    }
    let dashboardData = {};
    switch (role) {
      case "admin":
        const userStats = await database_default.getUserStats();
        const allJobs = await database_default.getJobs();
        const allProposals = await database_default.getAllProposals();
        dashboardData = {
          stats: {
            totalUsers: userStats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
            totalJobs: allJobs.length,
            totalProposals: allProposals.length,
            activeJobs: allJobs.filter((job) => job.status === "active").length
          },
          recentUsers: await database_default.getAllUsers({ limit: 5 }),
          recentJobs: allJobs.slice(0, 5)
        };
        break;
      case "client":
        const clientJobs = await database_default.getJobs();
        const clientProjects = await database_default.getUserProjects(user.id, "client");
        dashboardData = {
          stats: {
            postedJobs: clientJobs.length,
            activeProjects: clientProjects.filter((p) => p.status === "active").length,
            totalSpent: user.total_earnings || 0
          },
          recentJobs: clientJobs.slice(0, 5),
          activeProjects: clientProjects.slice(0, 5)
        };
        break;
      case "freelancer":
        const freelancerProposals = await database_default.getUserProposals(user.id);
        const freelancerProjects = await database_default.getUserProjects(user.id, "freelancer");
        const savedJobs2 = await database_default.getSavedJobs(user.id);
        dashboardData = {
          stats: {
            submittedProposals: freelancerProposals.length,
            activeProjects: freelancerProjects.filter((p) => p.status === "active").length,
            totalEarnings: user.total_earnings || 0,
            savedJobs: savedJobs2.length
          },
          recentProposals: freelancerProposals.slice(0, 5),
          activeProjects: freelancerProjects.slice(0, 5),
          recommendedJobs: await database_default.getJobs()
        };
        break;
      default:
        return res.status(400).json({
          status: "error",
          message: "Invalid role"
        });
    }
    res.json({
      status: "success",
      role,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      },
      dashboard: dashboardData
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard data"
    });
  }
});
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/jobs", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/jobs/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/contracts", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/post-job", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/projects", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/projects/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/saved-jobs", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.get("/proposals", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});
app.use(express.static(path.join(__dirname, "../dist"), {
  setHeaders: (res, path2) => {
    if (path2.endsWith(".js")) {
      res.setHeader("Content-Type", "application/javascript");
    } else if (path2.endsWith(".css")) {
      res.setHeader("Content-Type", "text/css");
    }
  }
}));
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({
      status: "error",
      message: "API endpoint not found",
      path: req.path
    });
  } else {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  }
});
app.get("/api/contracts", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    console.log(`Getting contracts for ${userType}: ${userId}`);
    const contracts2 = await database_default.getContracts(userId, userType);
    res.json({ contracts: contracts2, success: true });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({
      status: "error",
      error: "Failed to fetch contracts"
    });
  }
});
app.patch("/api/proposals/:id/status", async (req, res) => {
  try {
    if (!req.session?.user && !req.session?.userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.session.userId || req.session.user?.id;
    const userType = req.session.user?.userType || req.session.user?.role;
    if (userType !== "client") {
      return res.status(403).json({
        status: "error",
        error: "Only clients can update proposal status"
      });
    }
    console.log(`Updating proposal ${id} status to: ${status} by client: ${userId}`);
    const result = await database_default.updateProposalStatus(parseInt(id), status, userId);
    if (!result) {
      return res.status(404).json({
        status: "error",
        error: "Proposal not found or unauthorized"
      });
    }
    if (status === "accepted") {
      try {
        const contract = await database_default.createContract({
          proposalId: parseInt(id),
          clientId: userId,
          freelancerId: result.freelancerId,
          jobId: result.jobId,
          proposedRate: result.proposedRate,
          estimatedDuration: result.estimatedDuration,
          status: "active",
          startDate: (/* @__PURE__ */ new Date()).toISOString()
        });
        console.log("Contract created:", contract);
        res.json({
          status: "success",
          message: "Proposal accepted and contract created successfully",
          proposal: result,
          contract
        });
      } catch (contractError) {
        console.error("Error creating contract:", contractError);
        res.json({
          status: "success",
          message: "Proposal accepted but contract creation failed",
          proposal: result,
          contractError: contractError.message
        });
      }
    } else {
      res.json({
        status: "success",
        message: `Proposal ${status} successfully`,
        proposal: result
      });
    }
  } catch (error) {
    console.error("Error updating proposal status:", error);
    res.status(500).json({
      status: "error",
      error: "Failed to update proposal status"
    });
  }
});
var server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log("Environment:", process.env.NODE_ENV || "development");
  console.log("Server:", "Express.js");
});
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
  process.exit(1);
});
var index_default = app;
export {
  index_default as default
};
