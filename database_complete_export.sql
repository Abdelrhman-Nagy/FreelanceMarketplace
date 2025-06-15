-- Complete Database Export for Freelancing Platform
-- Generated: $(date)
-- Database: PostgreSQL

-- ================================
-- SCHEMA EXPORT
-- ================================

-- Drop existing tables
DROP TABLE IF EXISTS user_suspensions CASCADE;
DROP TABLE IF EXISTS admin_stats CASCADE;
DROP TABLE IF EXISTS contracts CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

-- Create sessions table
CREATE TABLE sessions (
    sid character varying PRIMARY KEY NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);

-- Create users table
CREATE TABLE users (
    id character varying PRIMARY KEY NOT NULL,
    email character varying UNIQUE,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    user_type character varying NOT NULL,
    title character varying,
    bio text,
    hourly_rate numeric,
    skills text[],
    location character varying,
    company character varying,
    created_at timestamp without time zone DEFAULT NOW(),
    updated_at timestamp without time zone DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
    id serial PRIMARY KEY,
    title character varying NOT NULL,
    description text NOT NULL,
    client_id character varying NOT NULL REFERENCES users(id),
    status character varying NOT NULL DEFAULT 'open',
    budget_type character varying NOT NULL,
    budget_min numeric,
    budget_max numeric,
    hourly_rate numeric,
    category character varying NOT NULL,
    experience_level character varying NOT NULL,
    skills text[],
    remote boolean DEFAULT true,
    proposal_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT NOW(),
    updated_at timestamp without time zone DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE proposals (
    id serial PRIMARY KEY,
    job_id integer NOT NULL REFERENCES jobs(id),
    freelancer_id character varying NOT NULL REFERENCES users(id),
    cover_letter text NOT NULL,
    proposed_rate numeric,
    timeline character varying,
    status character varying NOT NULL DEFAULT 'pending',
    created_at timestamp without time zone DEFAULT NOW(),
    updated_at timestamp without time zone DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id serial PRIMARY KEY,
    sender_id character varying NOT NULL REFERENCES users(id),
    receiver_id character varying NOT NULL REFERENCES users(id),
    content text NOT NULL,
    job_id integer REFERENCES jobs(id),
    proposal_id integer REFERENCES proposals(id),
    read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE contracts (
    id serial PRIMARY KEY,
    job_id integer NOT NULL REFERENCES jobs(id),
    freelancer_id character varying NOT NULL REFERENCES users(id),
    client_id character varying NOT NULL REFERENCES users(id),
    proposal_id integer NOT NULL REFERENCES proposals(id),
    status character varying NOT NULL DEFAULT 'active',
    total_earnings numeric DEFAULT 0,
    hours_worked numeric DEFAULT 0,
    created_at timestamp without time zone DEFAULT NOW(),
    updated_at timestamp without time zone DEFAULT NOW()
);

-- Create admin_stats table
CREATE TABLE admin_stats (
    id serial PRIMARY KEY,
    total_users integer DEFAULT 0,
    total_jobs integer DEFAULT 0,
    total_proposals integer DEFAULT 0,
    total_contracts integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    updated_at timestamp without time zone DEFAULT NOW()
);

-- Create user_suspensions table
CREATE TABLE user_suspensions (
    id serial PRIMARY KEY,
    user_id character varying NOT NULL REFERENCES users(id),
    admin_id character varying NOT NULL REFERENCES users(id),
    reason text NOT NULL,
    suspended_until timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_expire ON sessions(expire);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);

-- ================================
-- DATA EXPORT
-- ================================

-- Insert users data
INSERT INTO users (id, email, first_name, last_name, profile_image_url, user_type, title, bio, hourly_rate, skills, location, company, created_at, updated_at) VALUES 
('admin123', 'admin@example.com', 'Admin', 'User', NULL, 'admin', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-14 15:28:21.133283', '2025-06-14 15:28:21.133283'),
('freelancer1', 'sarah.dev@example.com', 'Sarah', 'Johnson', NULL, 'freelancer', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-14 15:36:43.876515', '2025-06-14 15:36:43.876515'),
('freelancer2', 'mike.designer@example.com', 'Mike', 'Chen', NULL, 'freelancer', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-14 15:36:43.876515', '2025-06-14 15:36:43.876515'),
('freelancer3', 'alex.data@example.com', 'Alex', 'Rodriguez', NULL, 'freelancer', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-14 15:36:43.876515', '2025-06-14 15:36:43.876515'),
('client1', 'startup.ceo@example.com', 'Emma', 'Wilson', NULL, 'client', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-14 15:36:43.876515', '2025-06-14 15:36:43.876515'),
('40715683', 'boody.nagy@gmail.com', 'Abdelrhman', 'Nagy', 'data:image/png;base64,[PROFILE_IMAGE_DATA]', 'client', '', 'Computer', NULL, ARRAY['React'], 'Egypt', 'FSCommunity', '2025-06-14 15:29:33.819', '2025-06-14 22:00:47.707');

-- Note: Profile image data truncated for readability

-- Reset sequence for jobs table
SELECT setval('jobs_id_seq', COALESCE((SELECT MAX(id) FROM jobs), 1));

-- Reset sequence for other tables
SELECT setval('proposals_id_seq', COALESCE((SELECT MAX(id) FROM proposals), 1));
SELECT setval('messages_id_seq', COALESCE((SELECT MAX(id) FROM messages), 1));
SELECT setval('contracts_id_seq', COALESCE((SELECT MAX(id) FROM contracts), 1));
SELECT setval('admin_stats_id_seq', COALESCE((SELECT MAX(id) FROM admin_stats), 1));
SELECT setval('user_suspensions_id_seq', COALESCE((SELECT MAX(id) FROM user_suspensions), 1));

-- Additional data will be exported below...