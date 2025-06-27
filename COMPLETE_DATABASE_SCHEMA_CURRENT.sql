-- FreelanceHub Database Schema Export
-- Generated: June 27, 2025
-- This schema matches the actual database structure with correct column mappings

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_type TEXT NOT NULL,
    company TEXT,
    rating INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    profile_image TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    password_hash VARCHAR,
    title TEXT,
    bio TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    hourly_rate INTEGER,
    location TEXT,
    timezone TEXT,
    phone_number TEXT,
    website TEXT,
    portfolio TEXT,
    experience TEXT,
    completed_jobs INTEGER DEFAULT 0,
    total_earnings INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITHOUT TIME ZONE,
    status TEXT DEFAULT 'active',
    role TEXT,
    approval_status TEXT DEFAULT 'pending',
    approved_by TEXT,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    rejection_reason TEXT
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    client_id TEXT NOT NULL REFERENCES users(id),
    category TEXT NOT NULL,
    budget_type TEXT NOT NULL,
    budget_min INTEGER,
    budget_max INTEGER,
    hourly_rate INTEGER,
    experience_level TEXT NOT NULL,
    skills JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    remote BOOLEAN DEFAULT false,
    duration TEXT,
    proposal_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITHOUT TIME ZONE,
    urgency_level TEXT DEFAULT 'normal',
    approval_status TEXT DEFAULT 'pending',
    approved_by TEXT,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    rejection_reason TEXT
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    freelancer_id TEXT NOT NULL REFERENCES users(id),
    cover_letter TEXT NOT NULL,
    proposed_rate INTEGER,
    estimated_duration TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    freelancer_name TEXT,
    freelancer_email TEXT,
    freelancer_title TEXT,
    freelancer_skills JSONB DEFAULT '[]'::jsonb
);

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    freelancer_id VARCHAR NOT NULL,
    client_id VARCHAR NOT NULL,
    proposal_id INTEGER NOT NULL REFERENCES proposals(id),
    status VARCHAR NOT NULL DEFAULT 'active',
    total_earnings NUMERIC DEFAULT 0,
    hours_worked NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    proposed_rate INTEGER,
    estimated_duration TEXT,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    terms TEXT
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_id TEXT NOT NULL REFERENCES users(id),
    freelancer_id TEXT REFERENCES users(id),
    job_id INTEGER REFERENCES jobs(id),
    status TEXT DEFAULT 'active',
    deadline DATE,
    budget NUMERIC,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    client_name TEXT,
    freelancer_name TEXT
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT REFERENCES users(id),
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    due_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create project_messages table
CREATE TABLE IF NOT EXISTS project_messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    sender_id TEXT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    uploaded_by TEXT NOT NULL REFERENCES users(id),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create saved_jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    saved_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id VARCHAR NOT NULL,
    receiver_id VARCHAR NOT NULL,
    content TEXT NOT NULL,
    job_id INTEGER REFERENCES jobs(id),
    proposal_id INTEGER REFERENCES proposals(id),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token VARCHAR NOT NULL,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create user_suspensions table
CREATE TABLE IF NOT EXISTS user_suspensions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    admin_id VARCHAR NOT NULL,
    reason TEXT NOT NULL,
    suspended_until TIMESTAMP WITHOUT TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create admin_stats table
CREATE TABLE IF NOT EXISTS admin_stats (
    id SERIAL PRIMARY KEY,
    total_users INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    total_proposals INTEGER DEFAULT 0,
    total_contracts INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create sessions table for express-session
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_approval_status ON jobs(approval_status);
CREATE INDEX IF NOT EXISTS idx_proposals_job_id ON proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_contracts_job_id ON contracts(job_id);
CREATE INDEX IF NOT EXISTS idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_freelancer_id ON projects(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- Insert default admin user if not exists
INSERT INTO users (
    id, email, password_hash, first_name, last_name, 
    user_type, role, status, approval_status, created_at
) VALUES (
    'admin-001', 
    'admin@freelancehub.com', 
    '$2b$10$dummy.hash.for.admin.user', 
    'Admin', 
    'User',
    'admin',
    'admin', 
    'active', 
    'approved', 
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Schema export complete
-- Total tables: 14
-- Key features: User management, Job posting, Proposals, Contracts, Projects, Messaging, Admin functionality