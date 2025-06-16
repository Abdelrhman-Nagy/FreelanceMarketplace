-- PostgreSQL Database Setup for Freelancing Platform
-- Run these commands as a PostgreSQL superuser or database administrator

-- 1. Create the database
CREATE DATABASE freelancing_platform
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- 2. Connect to the database
\c freelancing_platform;

-- 3. Create application user with limited privileges
CREATE USER app_user WITH PASSWORD 'your_secure_password_here';

-- 4. Grant necessary permissions to app_user
GRANT CONNECT ON DATABASE freelancing_platform TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT CREATE ON SCHEMA public TO app_user;

-- 5. Create tables with proper structure

-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url VARCHAR(500),
    user_type VARCHAR(50) NOT NULL DEFAULT 'freelancer',
    title VARCHAR(255),
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    skills TEXT[],
    location VARCHAR(255),
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget_type VARCHAR(50) NOT NULL DEFAULT 'fixed',
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    hourly_rate DECIMAL(10,2),
    experience_level VARCHAR(50) NOT NULL,
    skills TEXT[],
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    remote BOOLEAN DEFAULT true,
    proposal_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Proposals table
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    freelancer_id VARCHAR(255) NOT NULL,
    cover_letter TEXT NOT NULL,
    proposed_rate DECIMAL(10,2),
    timeline VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Contracts table
CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    freelancer_id VARCHAR(255) NOT NULL,
    client_id VARCHAR(255) NOT NULL,
    proposal_id INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    hours_worked DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL
);

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    job_id INTEGER,
    proposal_id INTEGER,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE CASCADE
);

-- Sessions table for authentication
CREATE TABLE sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Admin stats table
CREATE TABLE admin_stats (
    id SERIAL PRIMARY KEY,
    total_users INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    total_proposals INTEGER DEFAULT 0,
    total_contracts INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User suspensions table
CREATE TABLE user_suspensions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    admin_id VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    suspended_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_sessions_expire ON sessions(expire);

-- 7. Grant permissions on all tables to app_user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 8. Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Create triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Insert sample data (optional)
-- Sample users
INSERT INTO users (id, email, first_name, last_name, user_type, title, bio, hourly_rate, skills, location) VALUES
('client_1', 'client1@example.com', 'John', 'Smith', 'client', 'CEO', 'Looking for talented developers', NULL, ARRAY['Business'], 'New York, NY'),
('client_2', 'client2@example.com', 'Sarah', 'Johnson', 'client', 'CTO', 'Tech startup founder', NULL, ARRAY['Technology'], 'San Francisco, CA'),
('freelancer_1', 'dev1@example.com', 'Mike', 'Wilson', 'freelancer', 'Full Stack Developer', 'Expert in React and Node.js', 75.00, ARRAY['React', 'Node.js', 'PostgreSQL'], 'Austin, TX'),
('freelancer_2', 'designer1@example.com', 'Lisa', 'Chen', 'freelancer', 'UI/UX Designer', 'Creative designer with 5+ years experience', 60.00, ARRAY['Figma', 'Adobe XD', 'User Research'], 'Seattle, WA');

-- Sample jobs
INSERT INTO jobs (title, description, client_id, category, budget_type, budget_min, budget_max, experience_level, skills, status) VALUES
('React Developer - E-commerce Platform', 'Build a modern e-commerce platform using React and Node.js with payment integration', 'client_1', 'Web Development', 'fixed', 2500.00, 3500.00, 'Intermediate', ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe'], 'active'),
('Mobile App Development - iOS/Android', 'Create a cross-platform mobile application for food delivery with real-time tracking', 'client_2', 'Mobile Development', 'fixed', 4000.00, 6000.00, 'Expert', ARRAY['React Native', 'Firebase', 'Payment Integration'], 'active'),
('UI/UX Design for SaaS Platform', 'Design user interface and user experience for a new SaaS dashboard', 'client_1', 'Design', 'hourly', NULL, NULL, 'Intermediate', ARRAY['Figma', 'User Research', 'Prototyping'], 'active'),
('Backend API Development', 'Build REST API with authentication and database integration', 'client_2', 'Backend Development', 'fixed', 3000.00, 4500.00, 'Expert', ARRAY['Node.js', 'PostgreSQL', 'JWT', 'Docker'], 'active');

-- Initialize admin stats
INSERT INTO admin_stats (total_users, total_jobs, total_proposals, total_contracts, total_revenue) 
VALUES (4, 4, 0, 0, 0.00);

-- 11. Set default permissions for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- Database setup complete
SELECT 'Freelancing Platform PostgreSQL database setup completed successfully!' as status;