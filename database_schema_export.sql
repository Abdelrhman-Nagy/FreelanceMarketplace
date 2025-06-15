-- Database Schema Export for Freelancing Platform
-- Generated on $(date)

-- Drop tables if they exist (for clean import)
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

-- Create indexes for better performance
CREATE INDEX idx_sessions_expire ON sessions(expire);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);