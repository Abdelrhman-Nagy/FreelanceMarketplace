-- FreelanceHub Complete Database Schema Export
-- Generated: June 27, 2025
-- Includes: Dual approval workflow for users and jobs
-- Features: User management, job posting, proposals, contracts, messaging, admin controls

-- ============================================
-- USERS TABLE - Core user management with approval workflow
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('admin', 'client', 'freelancer')),
  approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  company VARCHAR(255),
  title VARCHAR(255),
  bio TEXT,
  skills TEXT[],
  hourly_rate DECIMAL(10,2),
  location VARCHAR(255),
  timezone VARCHAR(100),
  phone_number VARCHAR(20),
  website VARCHAR(255),
  portfolio VARCHAR(255),
  experience VARCHAR(20) CHECK (experience IN ('entry', 'intermediate', 'expert')),
  rating DECIMAL(3,2) DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- JOBS TABLE - Job postings with approval workflow
-- ============================================

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  budget_type VARCHAR(20) DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly')),
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  budget DECIMAL(10,2) NOT NULL,
  experience_level VARCHAR(20) CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
  skills TEXT[] NOT NULL,
  duration VARCHAR(100),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'suspended')),
  approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  is_urgent BOOLEAN DEFAULT FALSE,
  urgency_level VARCHAR(20) DEFAULT 'normal' CHECK (urgency_level IN ('low', 'normal', 'high', 'urgent')),
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROPOSALS TABLE - Freelancer job applications
-- ============================================

CREATE TABLE proposals (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_letter TEXT NOT NULL,
  proposed_rate DECIMAL(10,2) NOT NULL,
  estimated_duration VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, freelancer_id)
);

-- ============================================
-- CONTRACTS TABLE - Active work agreements
-- ============================================

CREATE TABLE contracts (
  id SERIAL PRIMARY KEY,
  proposal_id INTEGER UNIQUE REFERENCES proposals(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  proposed_rate DECIMAL(10,2) NOT NULL,
  estimated_duration VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'terminated', 'disputed')),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  terms TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROJECTS TABLE - Project management
-- ============================================

CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
  contract_id INTEGER REFERENCES contracts(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'cancelled')),
  budget DECIMAL(10,2),
  deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TASKS TABLE - Project task management
-- ============================================

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROJECT_MESSAGES TABLE - Project communication
-- ============================================

CREATE TABLE project_messages (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PROJECT_MEMBERS TABLE - Project team management
-- ============================================

CREATE TABLE project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  permissions TEXT[],
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

-- ============================================
-- PROJECT_FILES TABLE - File management
-- ============================================

CREATE TABLE project_files (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SAVED_JOBS TABLE - User job bookmarks
-- ============================================

CREATE TABLE saved_jobs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, job_id)
);

-- ============================================
-- MESSAGES TABLE - Direct user messaging
-- ============================================

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  message_type VARCHAR(20) DEFAULT 'direct' CHECK (message_type IN ('direct', 'system', 'notification')),
  parent_message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER_SESSIONS TABLE - Session management
-- ============================================

CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- ============================================
-- USER_PERMISSIONS TABLE - Role-based permissions
-- ============================================

CREATE TABLE user_permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(100) NOT NULL,
  granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission)
);

-- ============================================
-- PASSWORD_RESET_TOKENS TABLE - Password recovery
-- ============================================

CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_approval_status ON users(approval_status);
CREATE INDEX idx_users_status ON users(status);

-- Job indexes
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_approval_status ON jobs(approval_status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_budget ON jobs(budget);

-- Proposal indexes
CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);

-- Contract indexes
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX idx_contracts_job_id ON contracts(job_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- Project indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_freelancer_id ON projects(freelancer_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Message indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_project_messages_project_id ON project_messages(project_id);

-- Session indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ============================================
-- SAMPLE DATA INSERTS (Optional - for testing)
-- ============================================

-- Insert admin user (pre-approved)
INSERT INTO users (
  email, password_hash, first_name, last_name, user_type, approval_status, status
) VALUES (
  'admin@freelancehub.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
  'Admin', 
  'User', 
  'admin', 
  'approved', 
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Insert test client user (approved)
INSERT INTO users (
  email, password_hash, first_name, last_name, user_type, approval_status, status,
  company, title, bio, location
) VALUES (
  'client@test.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
  'John', 
  'Client', 
  'client', 
  'approved', 
  'active',
  'TechCorp Inc.',
  'Project Manager',
  'Experienced project manager looking for talented freelancers',
  'San Francisco, CA'
) ON CONFLICT (email) DO NOTHING;

-- Insert test freelancer user (approved)
INSERT INTO users (
  email, password_hash, first_name, last_name, user_type, approval_status, status,
  title, bio, skills, hourly_rate, location, experience, rating
) VALUES (
  'freelancer@test.com', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
  'Jane', 
  'Freelancer', 
  'freelancer', 
  'approved', 
  'active',
  'Full Stack Developer',
  'Experienced full-stack developer specializing in React and Node.js',
  ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  75.00,
  'New York, NY',
  'expert',
  4.8
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- NOTES
-- ============================================

/*
DUAL APPROVAL WORKFLOW:
1. User Registration: New users get approval_status = 'pending' and cannot login until approved
2. Job Posting: New jobs get approval_status = 'pending' and are not visible until approved

ADMIN CAPABILITIES:
- Approve/reject user registrations
- Approve/reject job postings
- Suspend users and jobs
- Full platform moderation

SECURITY FEATURES:
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- Input validation with constraints

SCALABILITY FEATURES:
- Comprehensive indexing
- Foreign key constraints with cascade options
- Optimized query structure
- Modular table design

This schema supports a complete freelance marketplace with:
- User management and approval workflow
- Job posting and approval system
- Proposal and contract management
- Project collaboration tools
- Messaging and communication
- Administrative controls
- Performance optimization
*/