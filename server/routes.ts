import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertJobSchema, 
  insertProposalSchema, 
  insertMessageSchema,
  insertContractSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const user = await storage.upsertUser({ id: userId, ...updates });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Job routes
  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'client') {
        return res.status(403).json({ message: "Only clients can post jobs" });
      }

      const jobData = insertJobSchema.parse({ ...req.body, clientId: userId });
      const job = await storage.createJob(jobData);
      res.json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get('/api/jobs', async (req, res) => {
    try {
      const { 
        category, 
        budgetMin, 
        budgetMax, 
        experienceLevel, 
        search, 
        skills,
        limit = "10",
        offset = "0"
      } = req.query;

      const filters = {
        category: category as string,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        experienceLevel: experienceLevel as string,
        search: search as string,
        skills: skills ? (skills as string).split(',') : undefined,
        limit: Number(limit),
        offset: Number(offset),
      };

      const result = await storage.getJobs(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get('/api/jobs/:id', async (req, res) => {
    try {
      const jobId = Number(req.params.id);
      const job = await storage.getJobWithClient(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json(job);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.get('/api/my-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobs = await storage.getJobsByClient(userId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.patch('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobId = Number(req.params.id);
      
      const job = await storage.getJob(jobId);
      if (!job || job.clientId !== userId) {
        return res.status(404).json({ message: "Job not found or unauthorized" });
      }

      const updatedJob = await storage.updateJob(jobId, req.body);
      res.json(updatedJob);
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  app.delete('/api/jobs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobId = Number(req.params.id);
      
      const job = await storage.getJob(jobId);
      if (!job || job.clientId !== userId) {
        return res.status(404).json({ message: "Job not found or unauthorized" });
      }

      await storage.deleteJob(jobId);
      res.json({ message: "Job deleted successfully" });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Proposal routes
  app.post('/api/proposals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'freelancer') {
        return res.status(403).json({ message: "Only freelancers can submit proposals" });
      }

      const proposalData = insertProposalSchema.parse({ ...req.body, freelancerId: userId });
      const proposal = await storage.createProposal(proposalData);
      res.json(proposal);
    } catch (error) {
      console.error("Error creating proposal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid proposal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  app.get('/api/jobs/:id/proposals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const jobId = Number(req.params.id);
      
      // Check if user owns the job
      const job = await storage.getJob(jobId);
      if (!job || job.clientId !== userId) {
        return res.status(403).json({ message: "Unauthorized to view proposals" });
      }

      const proposals = await storage.getProposalsByJob(jobId);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.get('/api/my-proposals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const proposals = await storage.getProposalsByFreelancer(userId);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching user proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.patch('/api/proposals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const proposalId = Number(req.params.id);
      
      const proposal = await storage.getProposal(proposalId);
      if (!proposal || proposal.freelancerId !== userId) {
        return res.status(404).json({ message: "Proposal not found or unauthorized" });
      }

      const updatedProposal = await storage.updateProposal(proposalId, req.body);
      res.json(updatedProposal);
    } catch (error) {
      console.error("Error updating proposal:", error);
      res.status(500).json({ message: "Failed to update proposal" });
    }
  });

  // Message routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({ ...req.body, senderId: userId });
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const otherUserId = req.params.otherUserId;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      
      const messages = await storage.getMessagesBetweenUsers(userId, otherUserId, limit);
      
      // Mark messages as read
      await storage.markMessagesAsRead(userId, otherUserId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/messages/unread/count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // Contract routes
  app.post('/api/contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contractData = insertContractSchema.parse(req.body);
      
      // Verify the user is the client for this job
      const job = await storage.getJob(contractData.jobId);
      if (!job || job.clientId !== userId) {
        return res.status(403).json({ message: "Unauthorized to create contract" });
      }

      const contract = await storage.createContract(contractData);
      res.json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid contract data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create contract" });
    }
  });

  app.get('/api/my-contracts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let contracts;
      if (user?.userType === 'freelancer') {
        contracts = await storage.getContractsByFreelancer(userId);
      } else {
        contracts = await storage.getContractsByClient(userId);
      }
      
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.patch('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contractId = Number(req.params.id);
      const { status } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid contract status" });
      }
      
      // Get the contract first to check permissions
      const contracts = await storage.getContractsByClient(userId);
      const freelancerContracts = await storage.getContractsByFreelancer(userId);
      const allUserContracts = [...contracts, ...freelancerContracts];
      
      const contract = allUserContracts.find(c => c.id === contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found or unauthorized" });
      }
      
      // Only clients can mark contracts as completed
      if (status === 'completed' && contract.clientId !== userId) {
        return res.status(403).json({ message: "Only clients can mark contracts as completed" });
      }
      
      const updatedContract = await storage.updateContract(contractId, { status });
      res.json(updatedContract);
    } catch (error) {
      console.error("Error updating contract:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  // Admin middleware
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user || user.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      next();
    } catch (error) {
      console.error("Admin middleware error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Admin routes
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.post("/api/admin/stats/update", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      await storage.updateAdminStats();
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error updating admin stats:", error);
      res.status(500).json({ message: "Failed to update admin stats" });
    }
  });

  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 20, userType, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const result = await storage.getAllUsers({
        userType: userType as string,
        search: search as string,
        limit: parseInt(limit),
        offset,
      });

      res.json({
        ...result,
        page: parseInt(page),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/jobs", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const result = await storage.getAllJobs({
        status: status as string,
        search: search as string,
        limit: parseInt(limit),
        offset,
      });

      res.json({
        ...result,
        page: parseInt(page),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/admin/proposals", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const result = await storage.getAllProposals({
        status: status as string,
        limit: parseInt(limit),
        offset,
      });

      res.json({
        ...result,
        page: parseInt(page),
        totalPages: Math.ceil(result.total / parseInt(limit)),
      });
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ message: "Failed to fetch proposals" });
    }
  });

  app.post("/api/admin/users/:userId/suspend", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { reason, suspendedUntil } = req.body;
      const adminId = req.user.claims.sub;

      if (!reason) {
        return res.status(400).json({ message: "Suspension reason is required" });
      }

      const suspension = await storage.suspendUser({
        userId,
        adminId,
        reason,
        suspendedUntil: suspendedUntil ? new Date(suspendedUntil) : null,
      });

      res.json(suspension);
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  app.post("/api/admin/users/:userId/unsuspend", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      await storage.unsuspendUser(userId);
      res.json({ message: "User unsuspended successfully" });
    } catch (error) {
      console.error("Error unsuspending user:", error);
      res.status(500).json({ message: "Failed to unsuspend user" });
    }
  });

  app.put("/api/admin/users/:userId/role", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { userType } = req.body;

      if (!['freelancer', 'client', 'admin'].includes(userType)) {
        return res.status(400).json({ message: "Invalid user type" });
      }

      const user = await storage.updateUserRole(userId, userType);
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete("/api/admin/users/:userId", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/admin/users/:userId/suspensions", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const suspensions = await storage.getUserSuspensions(userId);
      res.json(suspensions);
    } catch (error) {
      console.error("Error fetching user suspensions:", error);
      res.status(500).json({ message: "Failed to fetch user suspensions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
