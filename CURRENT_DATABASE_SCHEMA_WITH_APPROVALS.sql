-- FreelanceHub Database Schema with Approval Workflow
-- Generated: June 24, 2025
-- Features: Dual approval system for user registration and job posting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with approval workflow
CREATE TABLE users (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    user_type text NOT NULL, -- 'client', 'freelancer', 'admin'
    company text,
    title text,
    bio text,
    skills text, -- JSON string
    hourly_rate integer,
    location text,
    timezone text,
    phone_number text,
    website text,
    portfolio text,
    experience text, -- 'entry', 'intermediate', 'expert'
    rating real DEFAULT 0,
    total_jobs integer DEFAULT 0,
    completed_jobs integer DEFAULT 0,
    total_earnings real DEFAULT 0,
    last_login_at timestamp,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW(),
    status text DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    -- NEW APPROVAL WORKFLOW COLUMNS
    approval_status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by text,
    approved_at timestamp,
    rejection_reason text
);

-- Jobs table with approval workflow  
CREATE TABLE jobs (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    skills text, -- JSON string
    budget_min integer,
    budget_max integer,
    budget_type text DEFAULT 'hourly', -- 'hourly', 'fixed'
    experience_level text,
    duration text,
    client_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status text DEFAULT 'active',
    proposal_count integer DEFAULT 0,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW(),
    deadline timestamp,
    urgency_level text DEFAULT 'normal',
    -- NEW APPROVAL WORKFLOW COLUMNS
    approval_status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by text,
    approved_at timestamp,
    rejection_reason text
);

-- Proposals table
CREATE TABLE proposals (
    id serial PRIMARY KEY,
    job_id integer NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    freelancer_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter text NOT NULL,
    proposed_rate integer NOT NULL,
    estimated_duration text,
    status text DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW(),
    freelancer_name text,
    freelancer_email text,
    freelancer_title text,
    freelancer_skills text[]
);

-- Projects table
CREATE TABLE projects (
    id serial PRIMARY KEY,
    title text NOT NULL,
    description text,
    client_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    proposal_id integer REFERENCES proposals(id),
    status text DEFAULT 'active', -- 'active', 'completed', 'cancelled'
    budget real,
    deadline timestamp,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- Contracts table
CREATE TABLE contracts (
    id serial PRIMARY KEY,
    proposal_id integer NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    client_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id integer NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status text DEFAULT 'active', -- 'active', 'completed', 'terminated'
    start_date timestamp DEFAULT NOW(),
    end_date timestamp,
    terms text,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id serial PRIMARY KEY,
    project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    assigned_to text REFERENCES users(id),
    status text DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    due_date timestamp,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- Project files table
CREATE TABLE project_files (
    id serial PRIMARY KEY,
    project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    uploaded_by text NOT NULL REFERENCES users(id),
    created_at timestamp DEFAULT NOW()
);

-- Project messages table
CREATE TABLE project_messages (
    id serial PRIMARY KEY,
    project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sender_id text NOT NULL REFERENCES users(id),
    content text NOT NULL,
    created_at timestamp DEFAULT NOW()
);

-- Project members table
CREATE TABLE project_members (
    id serial PRIMARY KEY,
    project_id integer NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role text DEFAULT 'member', -- 'owner', 'member'
    joined_at timestamp DEFAULT NOW()
);

-- User sessions table
CREATE TABLE user_sessions (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token text NOT NULL UNIQUE,
    expires_at timestamp NOT NULL,
    created_at timestamp DEFAULT NOW()
);

-- User permissions table
CREATE TABLE user_permissions (
    id serial PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission text NOT NULL,
    granted_at timestamp DEFAULT NOW(),
    granted_by text REFERENCES users(id)
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id text PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token text NOT NULL UNIQUE,
    expires_at timestamp NOT NULL,
    created_at timestamp DEFAULT NOW()
);

-- Saved jobs table
CREATE TABLE saved_jobs (
    id serial PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id integer NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at timestamp DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Messages table (direct messaging)
CREATE TABLE messages (
    id serial PRIMARY KEY,
    sender_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content text NOT NULL,
    job_id integer REFERENCES jobs(id),
    proposal_id integer REFERENCES proposals(id),
    read boolean DEFAULT false,
    created_at timestamp DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_approval_status ON jobs(approval_status);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_freelancer_id ON projects(freelancer_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);

-- Initial admin user (update credentials as needed)
INSERT INTO users (
    email, password_hash, first_name, last_name, user_type, approval_status
) VALUES (
    'admin@freelancehub.com', 
    '$2b$10$hashedpassword', 
    'Admin', 
    'User', 
    'admin',
    'approved'
) ON CONFLICT (email) DO NOTHING;

-- Comments
COMMENT ON TABLE users IS 'User accounts with approval workflow - new registrations require admin approval';
COMMENT ON TABLE jobs IS 'Job postings with approval workflow - new jobs require admin approval before appearing on Browse Jobs';
COMMENT ON COLUMN users.approval_status IS 'User approval status: pending (default), approved, rejected';
COMMENT ON COLUMN jobs.approval_status IS 'Job approval status: pending (default), approved, rejected';