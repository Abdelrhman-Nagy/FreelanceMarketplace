import { pgTable, text, integer, timestamp, boolean, jsonb, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"), // hashed password for authentication
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  userType: text("user_type").notNull(), // 'admin', 'client', or 'freelancer'
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
  experience: text("experience"), // 'entry', 'intermediate', 'expert'
  rating: integer("rating").default(0),
  totalJobs: integer("total_jobs").default(0),
  completedJobs: integer("completed_jobs").default(0),
  totalEarnings: integer("total_earnings").default(0),
  profileImage: text("profile_image"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clientId: text("client_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  budgetType: text("budget_type").notNull(), // 'fixed' or 'hourly'
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  freelancerId: text("freelancer_id").notNull().references(() => users.id),
  coverLetter: text("cover_letter").notNull(),
  proposedRate: integer("proposed_rate"),
  estimatedDuration: text("estimated_duration"),
  status: text("status").default("pending"), // 'pending', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobsAsClient: many(jobs),
  proposals: many(proposals),
  sessions: many(userSessions),
  permissions: many(userPermissions),
  grantedPermissions: many(userPermissions, { relationName: "grantedBy" }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(users, {
    fields: [jobs.clientId],
    references: [users.id],
  }),
  proposals: many(proposals),
}));

export const proposalsRelations = relations(proposals, ({ one }) => ({
  job: one(jobs, {
    fields: [proposals.jobId],
    references: [jobs.id],
  }),
  freelancer: one(users, {
    fields: [proposals.freelancerId],
    references: [users.id],
  }),
}));

// User sessions table for authentication
export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User permissions for role-based access
export const userPermissions = pgTable("user_permissions", {
  id: varchar("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  permission: varchar("permission").notNull(),
  resourceType: varchar("resource_type"),
  resourceId: varchar("resource_id"),
  granted: boolean("granted").default(true),
  grantedBy: text("granted_by").references(() => users.id),
  grantedAt: timestamp("granted_at").defaultNow(),
});

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const userPermissionsRelations = relations(userPermissions, ({ one }) => ({
  user: one(users, {
    fields: [userPermissions.userId],
    references: [users.id],
  }),
  grantedByUser: one(users, {
    fields: [userPermissions.grantedBy],
    references: [users.id],
    relationName: "grantedBy",
  }),
}));

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Project Management Tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  clientId: text("client_id").notNull().references(() => users.id),
  freelancerId: text("freelancer_id").references(() => users.id),
  jobId: integer("job_id").references(() => jobs.id),
  status: text("status").default("active"),
  deadline: timestamp("deadline"),
  budget: integer("budget"), // stored in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: text("assigned_to").references(() => users.id),
  status: text("status").default("todo"),
  priority: text("priority").default("medium"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectMessages = pgTable("project_messages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  senderId: text("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").default("text"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Project Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(users, {
    fields: [projects.clientId],
    references: [users.id],
  }),
  freelancer: one(users, {
    fields: [projects.freelancerId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [projects.jobId],
    references: [jobs.id],
  }),
  tasks: many(tasks),
  files: many(projectFiles),
  messages: many(projectMessages),
  members: many(projectMembers),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
  uploader: one(users, {
    fields: [projectFiles.uploadedBy],
    references: [users.id],
  }),
}));

export const projectMessagesRelations = relations(projectMessages, ({ one }) => ({
  project: one(projects, {
    fields: [projectMessages.projectId],
    references: [projects.id],
  }),
  sender: one(users, {
    fields: [projectMessages.senderId],
    references: [users.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertJobSchema = createInsertSchema(jobs);
export const insertProposalSchema = createInsertSchema(proposals);
export const insertProjectSchema = createInsertSchema(projects);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertProjectFileSchema = createInsertSchema(projectFiles);
export const insertProjectMessageSchema = createInsertSchema(projectMessages);
export const insertProjectMemberSchema = createInsertSchema(projectMembers);

// Saved Jobs Table
export const savedJobs = pgTable("saved_jobs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Saved Jobs Relations
export const savedJobsRelations = relations(savedJobs, ({ one }) => ({
  user: one(users, {
    fields: [savedJobs.userId],
    references: [users.id],
  }),
  job: one(jobs, {
    fields: [savedJobs.jobId],
    references: [jobs.id],
  }),
}));

export const insertSavedJobSchema = createInsertSchema(savedJobs);