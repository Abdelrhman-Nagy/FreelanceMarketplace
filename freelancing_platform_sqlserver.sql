-- Freelancing Platform Database Export for SQL Server
-- Generated from PostgreSQL database
-- Compatible with Microsoft SQL Server 2016+

USE master;
GO

-- Create database if it doesn't exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'FreelancingPlatform')
BEGIN
    CREATE DATABASE FreelancingPlatform;
END
GO

USE FreelancingPlatform;
GO

-- Drop existing tables if they exist
IF OBJECT_ID('user_suspensions', 'U') IS NOT NULL DROP TABLE user_suspensions;
IF OBJECT_ID('admin_stats', 'U') IS NOT NULL DROP TABLE admin_stats;
IF OBJECT_ID('contracts', 'U') IS NOT NULL DROP TABLE contracts;
IF OBJECT_ID('messages', 'U') IS NOT NULL DROP TABLE messages;
IF OBJECT_ID('proposals', 'U') IS NOT NULL DROP TABLE proposals;
IF OBJECT_ID('jobs', 'U') IS NOT NULL DROP TABLE jobs;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID('sessions', 'U') IS NOT NULL DROP TABLE sessions;
GO

-- Create sessions table
CREATE TABLE sessions (
    sid NVARCHAR(255) PRIMARY KEY NOT NULL,
    sess NVARCHAR(MAX) NOT NULL, -- JSON data
    expire DATETIME2 NOT NULL
);
GO

-- Create users table
CREATE TABLE users (
    id NVARCHAR(255) PRIMARY KEY NOT NULL,
    email NVARCHAR(255) UNIQUE NULL,
    first_name NVARCHAR(255) NULL,
    last_name NVARCHAR(255) NULL,
    profile_image_url NVARCHAR(MAX) NULL,
    user_type NVARCHAR(50) NOT NULL,
    title NVARCHAR(255) NULL,
    bio NTEXT NULL,
    hourly_rate DECIMAL(10,2) NULL,
    skills NVARCHAR(MAX) NULL, -- JSON array as string
    location NVARCHAR(255) NULL,
    company NVARCHAR(255) NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create jobs table
CREATE TABLE jobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    description NTEXT NOT NULL,
    client_id NVARCHAR(255) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'open',
    budget_type NVARCHAR(20) NOT NULL,
    budget_min DECIMAL(10,2) NULL,
    budget_max DECIMAL(10,2) NULL,
    hourly_rate DECIMAL(10,2) NULL,
    category NVARCHAR(100) NOT NULL,
    experience_level NVARCHAR(50) NOT NULL,
    skills NVARCHAR(MAX) NULL, -- JSON array as string
    remote BIT DEFAULT 1,
    proposal_count INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (client_id) REFERENCES users(id)
);
GO

-- Create proposals table
CREATE TABLE proposals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT NOT NULL,
    freelancer_id NVARCHAR(255) NOT NULL,
    cover_letter NTEXT NOT NULL,
    proposed_rate DECIMAL(10,2) NULL,
    timeline NVARCHAR(255) NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id)
);
GO

-- Create messages table
CREATE TABLE messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sender_id NVARCHAR(255) NOT NULL,
    receiver_id NVARCHAR(255) NOT NULL,
    content NTEXT NOT NULL,
    job_id INT NULL,
    proposal_id INT NULL,
    read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);
GO

-- Create contracts table
CREATE TABLE contracts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT NOT NULL,
    freelancer_id NVARCHAR(255) NOT NULL,
    client_id NVARCHAR(255) NOT NULL,
    proposal_id INT NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'active',
    total_earnings DECIMAL(10,2) DEFAULT 0,
    hours_worked DECIMAL(8,2) DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);
GO

-- Create admin_stats table
CREATE TABLE admin_stats (
    id INT IDENTITY(1,1) PRIMARY KEY,
    total_users INT DEFAULT 0,
    total_jobs INT DEFAULT 0,
    total_proposals INT DEFAULT 0,
    total_contracts INT DEFAULT 0,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create user_suspensions table
CREATE TABLE user_suspensions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(255) NOT NULL,
    admin_id NVARCHAR(255) NOT NULL,
    reason NTEXT NOT NULL,
    suspended_until DATETIME2 NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (admin_id) REFERENCES users(id)
);
GO

-- Create indexes for better performance
CREATE INDEX IX_sessions_expire ON sessions(expire);
CREATE INDEX IX_jobs_client_id ON jobs(client_id);
CREATE INDEX IX_jobs_status ON jobs(status);
CREATE INDEX IX_proposals_job_id ON proposals(job_id);
CREATE INDEX IX_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX IX_messages_sender_id ON messages(sender_id);
CREATE INDEX IX_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IX_contracts_freelancer_id ON contracts(freelancer_id);
CREATE INDEX IX_contracts_client_id ON contracts(client_id);
GO

-- Insert sample data
-- Insert users
INSERT INTO users (id, email, first_name, last_name, profile_image_url, user_type, title, bio, hourly_rate, skills, location, company, created_at, updated_at) VALUES 
('admin123', 'admin@example.com', 'Admin', 'User', NULL, 'admin', NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-14 15:28:21.133', '2025-06-14 15:28:21.133'),
('freelancer1', 'sarah.dev@example.com', 'Sarah', 'Johnson', NULL, 'freelancer', 'Full Stack Developer', 'Experienced developer specializing in React and Node.js', 75.00, '["React", "Node.js", "JavaScript", "TypeScript"]', 'San Francisco, CA', NULL, '2025-06-14 15:36:43.876', '2025-06-14 15:36:43.876'),
('freelancer2', 'mike.designer@example.com', 'Mike', 'Chen', NULL, 'freelancer', 'UI/UX Designer', 'Creative designer with focus on user experience', 65.00, '["UI Design", "UX Design", "Figma", "Adobe Creative Suite"]', 'New York, NY', NULL, '2025-06-14 15:36:43.876', '2025-06-14 15:36:43.876'),
('freelancer3', 'alex.data@example.com', 'Alex', 'Rodriguez', NULL, 'freelancer', 'Data Scientist', 'Machine learning and data analysis expert', 85.00, '["Python", "Machine Learning", "Data Analysis", "SQL"]', 'Austin, TX', NULL, '2025-06-14 15:36:43.876', '2025-06-14 15:36:43.876'),
('client1', 'startup.ceo@example.com', 'Emma', 'Wilson', NULL, 'client', 'CEO', 'Tech startup founder looking for talented developers', NULL, NULL, 'Seattle, WA', 'TechStart Inc', '2025-06-14 15:36:43.876', '2025-06-14 15:36:43.876'),
('40715683', 'boody.nagy@gmail.com', 'Abdelrhman', 'Nagy', NULL, 'client', '', 'Computer', NULL, '["React"]', 'Egypt', 'FSCommunity', '2025-06-14 15:29:33.819', '2025-06-14 22:00:47.707');
GO

-- Insert sample jobs
SET IDENTITY_INSERT jobs ON;
INSERT INTO jobs (id, title, description, client_id, status, budget_type, budget_min, budget_max, hourly_rate, category, experience_level, skills, remote, proposal_count, created_at, updated_at) VALUES
(1, 'E-commerce Website Development', 'Need a modern e-commerce website built with React and Node.js. Should include payment integration, user authentication, and admin panel.', 'client1', 'open', 'fixed', 5000.00, 8000.00, NULL, 'Web Development', 'intermediate', '["React", "Node.js", "JavaScript", "Payment Integration"]', 1, 3, '2025-06-14 16:00:00.000', '2025-06-14 16:00:00.000'),
(2, 'Mobile App UI/UX Design', 'Looking for a talented designer to create modern and intuitive UI/UX for our mobile fitness app.', 'client1', 'in_progress', 'fixed', 2000.00, 3500.00, NULL, 'Design', 'expert', '["UI Design", "UX Design", "Mobile Design", "Figma"]', 1, 1, '2025-06-14 17:00:00.000', '2025-06-14 17:00:00.000'),
(3, 'Data Analysis Project', 'Need analysis of customer behavior data and creation of predictive models for our retail business.', 'client1', 'open', 'hourly', NULL, NULL, 80.00, 'Data Science', 'expert', '["Python", "Machine Learning", "Data Analysis", "SQL"]', 1, 2, '2025-06-14 18:00:00.000', '2025-06-14 18:00:00.000'),
(4, 'CREATE REACT DASHBOARD', 'Dashboard Development using React', '40715683', 'open', 'fixed', 1000.00, 5000.00, NULL, 'Web Development', 'beginner', '["React", "JavaScript"]', 1, 0, '2025-06-14 21:57:52.198', '2025-06-14 21:57:52.198');
SET IDENTITY_INSERT jobs OFF;
GO

-- Insert sample proposals
SET IDENTITY_INSERT proposals ON;
INSERT INTO proposals (id, job_id, freelancer_id, cover_letter, proposed_rate, timeline, status, created_at, updated_at) VALUES
(1, 1, 'freelancer1', 'I am excited to work on your e-commerce project. With 5+ years of experience in React and Node.js, I can deliver a high-quality solution that meets all your requirements.', 6500.00, '6-8 weeks', 'pending', '2025-06-14 16:30:00.000', '2025-06-14 16:30:00.000'),
(2, 1, 'freelancer2', 'Hello! I would love to help with the technical implementation of your e-commerce site. I have extensive experience with payment integrations and can ensure a smooth user experience.', 7000.00, '8-10 weeks', 'pending', '2025-06-14 16:45:00.000', '2025-06-14 16:45:00.000'),
(3, 2, 'freelancer2', 'I specialize in mobile app design and have created UIs for several successful fitness apps. I can provide you with modern, user-friendly designs that will engage your users.', 2800.00, '3-4 weeks', 'accepted', '2025-06-14 17:15:00.000', '2025-06-14 17:15:00.000'),
(4, 3, 'freelancer3', 'I have extensive experience in retail data analysis and predictive modeling. I can help you uncover valuable insights from your customer data and build models to predict future behavior.', 80.00, '4-6 weeks', 'pending', '2025-06-14 18:20:00.000', '2025-06-14 18:20:00.000'),
(5, 1, 'freelancer3', 'While my expertise is primarily in data science, I also have full-stack development experience and would be happy to contribute to your e-commerce project.', 6000.00, '7-9 weeks', 'pending', '2025-06-14 18:30:00.000', '2025-06-14 18:30:00.000');
SET IDENTITY_INSERT proposals OFF;
GO

-- Insert sample contracts
SET IDENTITY_INSERT contracts ON;
INSERT INTO contracts (id, job_id, freelancer_id, client_id, proposal_id, status, total_earnings, hours_worked, created_at, updated_at) VALUES
(1, 2, 'freelancer2', 'client1', 3, 'active', 1400.00, 35.50, '2025-06-14 17:30:00.000', '2025-06-14 20:00:00.000'),
(2, 1, 'freelancer1', 'client1', 1, 'completed', 6500.00, 160.00, '2025-06-13 10:00:00.000', '2025-06-14 15:00:00.000'),
(3, 1, 'freelancer1', '40715683', 1, 'active', 0.00, 0.00, '2025-06-14 21:58:45.725', '2025-06-14 21:58:45.725');
SET IDENTITY_INSERT contracts OFF;
GO

-- Insert sample messages
SET IDENTITY_INSERT messages ON;
INSERT INTO messages (id, sender_id, receiver_id, content, job_id, proposal_id, read, created_at) VALUES
(1, 'client1', 'freelancer1', 'Hi Sarah, I reviewed your proposal for the e-commerce project. Very impressive! I would like to discuss the timeline in more detail.', 1, 1, 1, '2025-06-14 16:35:00.000'),
(2, 'freelancer1', 'client1', 'Thank you for your interest! I am available for a call this week to discuss the project timeline and any specific requirements you might have.', 1, 1, 1, '2025-06-14 16:40:00.000'),
(3, 'client1', 'freelancer2', 'Your portfolio is amazing! I would love to move forward with your proposal for the mobile app design.', 2, 3, 1, '2025-06-14 17:20:00.000'),
(4, 'freelancer2', 'client1', 'Wonderful! I am excited to start working on this project. When would be a good time to kick off?', 2, 3, 1, '2025-06-14 17:25:00.000'),
(5, 'freelancer3', 'client1', 'I have some initial questions about the data analysis project. Could we schedule a brief call to discuss the scope?', 3, 4, 0, '2025-06-14 18:25:00.000');
SET IDENTITY_INSERT messages OFF;
GO

-- Insert admin stats
SET IDENTITY_INSERT admin_stats ON;
INSERT INTO admin_stats (id, total_users, total_jobs, total_proposals, total_contracts, total_revenue, updated_at) VALUES
(1, 6, 4, 5, 3, 7900.00, '2025-06-14 22:00:00.000');
SET IDENTITY_INSERT admin_stats OFF;
GO

-- Create stored procedures for common operations
CREATE PROCEDURE sp_GetUserStats
    @user_id NVARCHAR(255)
AS
BEGIN
    SELECT 
        u.first_name + ' ' + u.last_name AS full_name,
        u.user_type,
        COUNT(DISTINCT j.id) AS total_jobs_posted,
        COUNT(DISTINCT p.id) AS total_proposals_submitted,
        COUNT(DISTINCT c.id) AS total_contracts,
        COALESCE(SUM(c.total_earnings), 0) AS total_earnings
    FROM users u
    LEFT JOIN jobs j ON u.id = j.client_id
    LEFT JOIN proposals p ON u.id = p.freelancer_id
    LEFT JOIN contracts c ON u.id = c.freelancer_id OR u.id = c.client_id
    WHERE u.id = @user_id
    GROUP BY u.id, u.first_name, u.last_name, u.user_type;
END
GO

CREATE PROCEDURE sp_GetJobsWithProposals
AS
BEGIN
    SELECT 
        j.id,
        j.title,
        j.description,
        j.budget_type,
        j.budget_min,
        j.budget_max,
        j.hourly_rate,
        j.status,
        j.proposal_count,
        u.first_name + ' ' + u.last_name AS client_name,
        j.created_at
    FROM jobs j
    INNER JOIN users u ON j.client_id = u.id
    ORDER BY j.created_at DESC;
END
GO

PRINT 'Database schema and sample data created successfully for SQL Server!';
PRINT 'Tables created: users, jobs, proposals, messages, contracts, admin_stats, user_suspensions, sessions';
PRINT 'Stored procedures created: sp_GetUserStats, sp_GetJobsWithProposals';
GO