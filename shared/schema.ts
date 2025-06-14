import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull().default('client'), // 'freelancer', 'client', or 'admin'
  title: varchar("title"), // Professional title for freelancers
  bio: text("bio"), // Professional bio
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }), // For freelancers
  skills: text("skills").array(), // Skills array for freelancers
  location: varchar("location"),
  company: varchar("company"), // For clients
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  clientId: varchar("client_id").notNull().references(() => users.id),
  category: varchar("category").notNull(),
  budgetType: varchar("budget_type").notNull(), // 'fixed' or 'hourly'
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  experienceLevel: varchar("experience_level").notNull(), // 'entry', 'intermediate', 'expert'
  skills: text("skills").array(),
  status: varchar("status").notNull().default("open"), // 'open', 'in_progress', 'completed', 'cancelled'
  remote: boolean("remote").default(true),
  proposalCount: integer("proposal_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  freelancerId: varchar("freelancer_id").notNull().references(() => users.id),
  coverLetter: text("cover_letter").notNull(),
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }),
  timeline: varchar("timeline"), // Estimated timeline
  status: varchar("status").notNull().default("submitted"), // 'submitted', 'interviewing', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  jobId: integer("job_id").references(() => jobs.id), // Optional job context
  proposalId: integer("proposal_id").references(() => proposals.id), // Optional proposal context
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").notNull().references(() => jobs.id),
  freelancerId: varchar("freelancer_id").notNull().references(() => users.id),
  clientId: varchar("client_id").notNull().references(() => users.id),
  proposalId: integer("proposal_id").notNull().references(() => proposals.id),
  status: varchar("status").notNull().default("active"), // 'active', 'completed', 'cancelled'
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  hoursWorked: decimal("hours_worked", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  jobsAsClient: many(jobs),
  proposals: many(proposals),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  contractsAsFreelancer: many(contracts, { relationName: "freelancerContracts" }),
  contractsAsClient: many(contracts, { relationName: "clientContracts" }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  client: one(users, {
    fields: [jobs.clientId],
    references: [users.id],
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
  }),
  messages: many(messages),
  contracts: many(contracts),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
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
    relationName: "freelancerContracts",
  }),
  client: one(users, {
    fields: [contracts.clientId],
    references: [users.id],
    relationName: "clientContracts",
  }),
  proposal: one(proposals, {
    fields: [contracts.proposalId],
    references: [proposals.id],
  }),
}));

// Admin statistics table
export const adminStats = pgTable("admin_stats", {
  id: serial("id").primaryKey(),
  totalUsers: integer("total_users").default(0),
  totalJobs: integer("total_jobs").default(0),
  totalProposals: integer("total_proposals").default(0),
  totalContracts: integer("total_contracts").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User bans/suspensions table
export const userSuspensions = pgTable("user_suspensions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  suspendedUntil: timestamp("suspended_until"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSuspensionSchema = createInsertSchema(userSuspensions).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  proposalCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  budgetMin: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  budgetMax: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
  hourlyRate: z.union([z.string(), z.number()]).transform((val) => Number(val)).optional(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  proposedRate: z.union([z.string(), z.number()]).transform((val) => Number(val)),
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

// Types
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
