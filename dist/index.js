var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import Hapi from "@hapi/hapi";
import Inert from "@hapi/inert";
import Vision from "@hapi/vision";
import path from "path";
import { fileURLToPath } from "url";

// server/database.js
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, sql, or, inArray } from "drizzle-orm";

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
        orderBy: (projects3, { desc }) => [desc(projects3.updatedAt)]
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
        orderBy: (proposals3, { desc }) => [desc(proposals3.createdAt)]
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
        orderBy: (savedJobs3, { desc }) => [desc(savedJobs3.savedAt)]
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
        orderBy: (proposals3, { desc }) => [desc(proposals3.createdAt)]
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
        throw new Error("Database not initialized");
      }
      const users2 = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return users2.length > 0 ? users2[0] : null;
    } catch (error) {
      console.error("Error getting user by email:", error);
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
};
var dbService = new DatabaseService();
var database_default = dbService;

// server/index.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var server = Hapi.server({
  port: process.env.PORT || 5e3,
  host: "0.0.0.0",
  routes: {
    cors: {
      origin: ["*"],
      headers: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
      additionalHeaders: ["cache-control", "x-requested-with"]
    },
    files: {
      relativeTo: path.join(__dirname, "../public")
    }
  }
});
server.route({
  method: "GET",
  path: "/api/jobs",
  handler: async (request, h) => {
    try {
      const jobs2 = await database_default.getJobs();
      return {
        jobs: jobs2,
        total: jobs2.length,
        status: "success",
        database: "Connected to PostgreSQL"
      };
    } catch (error) {
      console.error("Jobs endpoint error:", error);
      return h.response({
        error: error.message,
        jobs: [],
        total: 0,
        status: "error",
        database: "PostgreSQL connection failed"
      }).code(500);
    }
  }
});
server.route({
  method: "GET",
  path: "/api/health",
  handler: async (request, h) => {
    const dbTest = await database_default.testConnection();
    return {
      status: "healthy",
      service: "Freelancing Platform API",
      version: "1.0.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: "postgresql",
      connection: {
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        status: dbTest.status,
        error: dbTest.error
      }
    };
  }
});
server.route({
  method: "GET",
  path: "/api/my-stats",
  handler: async (request, h) => {
    try {
      const userId = "freelancer_001";
      const stats = await database_default.getUserStats(userId);
      return {
        ...stats,
        status: "success"
      };
    } catch (error) {
      console.error("Stats endpoint error:", error);
      return h.response({
        error: error.message,
        status: "error"
      }).code(500);
    }
  }
});
server.route({
  method: "GET",
  path: "/api/test",
  handler: (request, h) => {
    return {
      status: "success",
      message: "API is working correctly",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      server: "Node.js Hapi",
      database: "postgresql",
      config: {
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
        user: process.env.PGUSER
      }
    };
  }
});
server.route({
  method: "GET",
  path: "/src/{param*}",
  handler: (request, h) => {
    const filePath = request.params.param;
    const response = h.file(filePath);
    if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
      return response.type("application/javascript");
    }
    if (filePath.endsWith(".css")) {
      return response.type("text/css");
    }
    return response;
  },
  options: {
    files: {
      relativeTo: path.join(__dirname, "../public/src")
    }
  }
});
server.route({
  method: "GET",
  path: "/assets/{param*}",
  handler: (request, h) => {
    const filePath = request.params.param;
    const response = h.file(filePath);
    if (filePath.endsWith(".js")) {
      return response.type("application/javascript");
    }
    return response;
  },
  options: {
    files: {
      relativeTo: path.join(__dirname, "../public/assets")
    }
  }
});
server.route({
  method: "GET",
  path: "/{param*}",
  handler: (request, h) => {
    const requestPath = request.path;
    if (requestPath.startsWith("/api/")) {
      return h.continue;
    }
    if (requestPath.includes(".") && !requestPath.startsWith("/src/") && !requestPath.startsWith("/assets/")) {
      return h.file(requestPath);
    }
    return h.file("index.html");
  },
  options: {
    files: {
      relativeTo: path.join(__dirname, "../public")
    }
  }
});
var init = async () => {
  await server.register([
    Inert,
    Vision
  ]);
  await server.start();
  console.log(`Server running on port ${server.info.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Server: Hapi.js`);
  return server;
};
process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});
init();
