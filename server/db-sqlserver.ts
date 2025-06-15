import sql from 'mssql';
import * as schema from "@shared/schema";

// SQL Server configuration
const config: sql.config = {
  user: process.env.SQL_SERVER_USER || '',
  password: process.env.SQL_SERVER_PASSWORD || '',
  server: process.env.SQL_SERVER_HOST || 'localhost',
  database: process.env.SQL_SERVER_DATABASE || 'FreelancingPlatform',
  port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Create connection pool
export const pool = new sql.ConnectionPool(config);

// Initialize connection
let isConnected = false;

export async function connectToSqlServer() {
  if (!isConnected) {
    try {
      await pool.connect();
      console.log('Connected to SQL Server successfully');
      isConnected = true;
    } catch (error) {
      console.error('Failed to connect to SQL Server:', error);
      throw error;
    }
  }
  return pool;
}

// SQL Server specific query helper
export async function executeQuery(query: string, params: any[] = []) {
  try {
    await connectToSqlServer();
    const request = pool.request();
    
    // Add parameters if provided
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('SQL Server query error:', error);
    throw error;
  }
}

// Database operations for SQL Server
export class SqlServerDatabase {
  async query(sql: string, params: any[] = []) {
    return await executeQuery(sql, params);
  }

  async getUsers() {
    const result = await this.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.recordset;
  }

  async getUserById(id: string) {
    const result = await this.query('SELECT * FROM users WHERE id = @param0', [id]);
    return result.recordset[0];
  }

  async createUser(user: any) {
    const query = `
      INSERT INTO users (id, email, first_name, last_name, profile_image_url, user_type, title, bio, hourly_rate, skills, location, company)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, @param11)
    `;
    const params = [user.id, user.email, user.firstName, user.lastName, user.profileImageUrl, user.userType, user.title, user.bio, user.hourlyRate, JSON.stringify(user.skills), user.location, user.company];
    return await this.query(query, params);
  }

  async getJobs() {
    const result = await this.query(`
      SELECT j.*, u.first_name + ' ' + u.last_name as client_name 
      FROM jobs j 
      INNER JOIN users u ON j.client_id = u.id 
      ORDER BY j.created_at DESC
    `);
    return result.recordset;
  }

  async createJob(job: any) {
    const query = `
      INSERT INTO jobs (title, description, client_id, status, budget_type, budget_min, budget_max, hourly_rate, category, experience_level, skills, remote)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10, @param11)
    `;
    const params = [job.title, job.description, job.clientId, job.status, job.budgetType, job.budgetMin, job.budgetMax, job.hourlyRate, job.category, job.experienceLevel, JSON.stringify(job.skills), job.remote];
    return await this.query(query, params);
  }

  async getProposals() {
    const result = await this.query(`
      SELECT p.*, j.title as job_title, u.first_name + ' ' + u.last_name as freelancer_name
      FROM proposals p
      INNER JOIN jobs j ON p.job_id = j.id
      INNER JOIN users u ON p.freelancer_id = u.id
      ORDER BY p.created_at DESC
    `);
    return result.recordset;
  }

  async createProposal(proposal: any) {
    const query = `
      INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_rate, timeline, status)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5)
    `;
    const params = [proposal.jobId, proposal.freelancerId, proposal.coverLetter, proposal.proposedRate, proposal.timeline, proposal.status];
    return await this.query(query, params);
  }
}

export const sqlServerDb = new SqlServerDatabase();

// Close connection on app shutdown
process.on('SIGINT', async () => {
  if (isConnected) {
    await pool.close();
    console.log('SQL Server connection closed');
  }
});

export { sql };