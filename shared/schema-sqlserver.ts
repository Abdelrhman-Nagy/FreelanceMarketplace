import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Sessions table for SQL Server compatibility
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess", { mode: "json" }).notNull(),
    expire: text("expire").notNull(), // Store as ISO string
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  userType: text("user_type", { enum: ["client", "freelancer", "admin"] }).notNull(),
  title: text("title"),
  bio: text("bio"),
  hourlyRate: real("hourly_rate"),
  skills: text("skills", { mode: "json" }).$type<string[]>(),
  location: text("location"),
  company: text("company"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Jobs table
export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clientId: text("client_id").notNull().references(() => users.id),
  status: text("status", { enum: ["open", "in_progress", "completed", "cancelled"] }).notNull().default("open"),
  budgetType: text("budget_type", { enum: ["fixed", "hourly"] }).notNull(),
  budgetMin: real("budget_min"),
  budgetMax: real("budget_max"),
  hourlyRate: real("hourly_rate"),
  category: text("category").notNull(),
  experienceLevel: text("experience_level", { enum: ["beginner", "intermediate", "expert"] }).notNull(),
  skills: text("skills", { mode: "json" }).$type<string[]>(),
  remote: integer("remote", { mode: "boolean" }).default(true),
  proposalCount: integer("proposal_count").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Proposals table
export const proposals = sqliteTable("proposals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  freelancerId: text("freelancer_id").notNull().references(() => users.id),
  coverLetter: text("cover_letter").notNull(),
  proposedRate: real("proposed_rate"),
  timeline: text("timeline"),
  status: text("status", { enum: ["pending", "accepted", "rejected"] }).notNull().default("pending"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Messages table
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: text("sender_id").notNull().references(() => users.id),
  receiverId: text("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  jobId: integer("job_id").references(() => jobs.id),
  proposalId: integer("proposal_id").references(() => proposals.id),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Contracts table
export const contracts = sqliteTable("contracts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  freelancerId: text("freelancer_id").notNull().references(() => users.id),
  clientId: text("client_id").notNull().references(() => users.id),
  proposalId: integer("proposal_id").notNull().references(() => proposals.id),
  status: text("status", { enum: ["active", "completed", "cancelled"] }).notNull().default("active"),
  totalEarnings: real("total_earnings").default(0),
  hoursWorked: real("hours_worked").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Admin stats table
export const adminStats = sqliteTable("admin_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  totalUsers: integer("total_users").default(0),
  totalJobs: integer("total_jobs").default(0),
  totalProposals: integer("total_proposals").default(0),
  totalContracts: integer("total_contracts").default(0),
  totalRevenue: real("total_revenue").default(0),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// User suspensions table
export const userSuspensions = sqliteTable("user_suspensions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  adminId: text("admin_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  suspendedUntil: text("suspended_until"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobsAsClient: many(jobs, { relationName: "ClientJobs" }),
  proposalsAsFreelancer: many(proposals, { relationName: "FreelancerProposals" }),
  sentMessages: many(messages, { relationName: "SentMessages" }),
  receivedMessages: many(messages, { relationName: "ReceivedMessages" }),
  contractsAsFreelancer: many(contracts, { relationName: "FreelancerContracts" }),
  contractsAsClient: many(contracts, { relationName: "ClientContracts" }),
  suspensions: many(userSuspensions, { relationName: "UserSuspensions" }),
  adminSuspensions: many(userSuspensions, { relationName: "AdminSuspensions" }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(users, {
    fields: [jobs.clientId],
    references: [users.id],
    relationName: "ClientJobs",
  }),
  proposals: many(proposals),
  messages: many(messages),
  contracts: many(contracts),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  job: one(jobs, {
    fields: [proposals.jobId],
    references: [jobs.id],
  }),
  freelancer: one(users, {
    fields: [proposals.freelancerId],
    references: [users.id],
    relationName: "FreelancerProposals",
  }),
  messages: many(messages),
  contracts: many(contracts),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "SentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "ReceivedMessages",
  }),
  job: one(jobs, {
    fields: [messages.jobId],
    references: [jobs.id],
  }),
  proposal: one(proposals, {
    fields: [messages.proposalId],
    references: [proposals.id],
  }),
}));

export const contractsRelations = relations(contracts, ({ one }) => ({
  job: one(jobs, {
    fields: [contracts.jobId],
    references: [jobs.id],
  }),
  freelancer: one(users, {
    fields: [contracts.freelancerId],
    references: [users.id],
    relationName: "FreelancerContracts",
  }),
  client: one(users, {
    fields: [contracts.clientId],
    references: [users.id],
    relationName: "ClientContracts",
  }),
  proposal: one(proposals, {
    fields: [contracts.proposalId],
    references: [proposals.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertSuspensionSchema = createInsertSchema(userSuspensions).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  proposalCount: true,
}).extend({
  skills: z.array(z.string()).optional(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertContractSchema = createInsertSchema(contracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;
export type Proposal = typeof proposals.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertSuspension = z.infer<typeof insertSuspensionSchema>;
export type Suspension = typeof userSuspensions.$inferSelect;
export type AdminStats = typeof adminStats.$inferSelect;