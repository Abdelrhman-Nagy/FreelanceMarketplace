-- FreelanceHub Complete Database Export
-- Generated on 2025-06-21

-- ========================================
-- TABLE STRUCTURES
-- ========================================

-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    user_type TEXT NOT NULL,
    company TEXT,
    rating INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password_hash TEXT,
    title TEXT,
    bio TEXT,
    skills JSONB DEFAULT '[]',
    hourly_rate DECIMAL,
    location TEXT,
    timezone TEXT,
    phone_number TEXT,
    website TEXT,
    portfolio TEXT,
    experience TEXT,
    completed_jobs INTEGER DEFAULT 0,
    total_earnings DECIMAL DEFAULT 0,
    last_login_at TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_id TEXT NOT NULL REFERENCES users(id),
    category TEXT,
    budget_type TEXT,
    budget_min INTEGER,
    budget_max INTEGER,
    hourly_rate DECIMAL,
    experience_level TEXT,
    skills JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active',
    remote BOOLEAN DEFAULT true,
    duration TEXT,
    proposal_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposals table
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    freelancer_id TEXT NOT NULL REFERENCES users(id),
    cover_letter TEXT,
    proposed_rate DECIMAL,
    estimated_duration TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    proposal_id INTEGER REFERENCES proposals(id),
    client_id TEXT NOT NULL REFERENCES users(id),
    freelancer_id TEXT NOT NULL REFERENCES users(id),
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    proposed_rate INTEGER,
    estimated_duration TEXT,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Jobs table
CREATE TABLE saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_id TEXT NOT NULL REFERENCES users(id),
    freelancer_id TEXT REFERENCES users(id),
    job_id INTEGER REFERENCES jobs(id),
    status TEXT DEFAULT 'active',
    deadline TIMESTAMP,
    budget INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT REFERENCES users(id),
    status TEXT DEFAULT 'todo',
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Files table
CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    uploaded_by TEXT NOT NULL REFERENCES users(id),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Messages table
CREATE TABLE project_messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    sender_id TEXT NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Members table
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions table
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens table
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- SAMPLE DATA
-- ========================================

-- Users (14 total)
INSERT INTO users VALUES 
('client_001', 'john.smith@techcorp.com', 'John', 'Smith', 'client', 'TechCorp Solutions', 48, 15, NULL, '2025-06-19 13:41:53.498933', '2025-06-19 13:41:53.498933', NULL, NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL),
('client_002', 'sarah.johnson@startupxyz.com', 'Sarah', 'Johnson', 'client', 'StartupXYZ', 49, 8, NULL, '2025-06-19 13:41:53.498933', '2025-06-19 13:41:53.498933', NULL, NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL),
('freelancer_001', 'alex.dev@gmail.com', 'Alex', 'Developer', 'freelancer', NULL, 47, 12, NULL, '2025-06-19 13:41:53.498933', '2025-06-19 13:41:53.498933', NULL, NULL, NULL, '[]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL);

-- Jobs (10 total)
INSERT INTO jobs VALUES 
(1, 'React Developer - E-commerce Platform', 'Build a modern e-commerce platform using React and Node.js with payment integration and user authentication.', 'client_001', 'Web Development', 'fixed', 2000, 2500, NULL, 'Intermediate', '["React", "Node.js", "PostgreSQL", "Payment Integration"]', 'active', true, '2-3 months', 1, '2025-06-19 13:42:02.986194', '2025-06-19 13:42:02.986194'),
(2, 'Mobile App Development - iOS/Android', 'Create a cross-platform mobile application for food delivery with real-time tracking.', 'client_002', 'Mobile Development', 'fixed', 3000, 3500, NULL, 'Expert', '["React Native", "Firebase", "Payment Integration", "GPS"]', 'active', true, '3-4 months', 1, '2025-06-19 13:42:02.986194', '2025-06-19 13:42:02.986194');

-- Proposals (13 total)
INSERT INTO proposals VALUES 
(1, 1, 'freelancer_001', 'I have 5+ years of experience building React applications and can deliver this e-commerce platform within your timeline.', 2300, '2.5 months', 'pending', '2025-06-19 13:42:09.162205', '2025-06-19 13:42:09.162205'),
(3, 3, 'freelancer_002', 'UI/UX designer with extensive SaaS experience. I will create a modern, conversion-focused design.', NULL, '6 weeks', 'accepted', '2025-06-19 13:42:09.162205', '2025-06-19 13:42:09.162205');

-- Contracts (3 total)
INSERT INTO contracts VALUES 
(1, 1, 'client_001', 'freelancer_001', 1, 1500, NULL, 'completed', NULL, NULL, NULL, '2025-06-07 15:37:36.428032', '2025-06-14 17:33:16.172'),
(2, 2, 'client_002', 'freelancer_002', 2, NULL, NULL, 'active', NULL, NULL, NULL, '2025-06-12 15:37:36.428032', '2025-06-14 17:33:37.661');

-- ========================================
-- DATABASE STATISTICS
-- ========================================
-- Total Records: 
-- Users: 14
-- Jobs: 10  
-- Proposals: 13
-- Contracts: 3
-- Saved Jobs: 7
-- Projects: 3
-- Tasks: 10
-- Project Messages: 8
-- Project Members: 6
-- User Sessions: 5
-- Password Reset Tokens: 0

-- ========================================
-- APPLICATION FEATURES SUPPORTED
-- ========================================
-- ✓ User Authentication (Client/Freelancer/Admin)
-- ✓ Job Posting and Management
-- ✓ Proposal Submission System
-- ✓ Contract Creation and Management
-- ✓ Project Collaboration Tools
-- ✓ Task Management
-- ✓ File Sharing
-- ✓ Real-time Messaging
-- ✓ User Profiles and Ratings
-- ✓ Saved Jobs Functionality
-- ✓ Session Management
-- ✓ Password Reset System