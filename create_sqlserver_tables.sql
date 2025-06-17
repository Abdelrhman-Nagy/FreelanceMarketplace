-- SQL Server Database Setup for Freelancing Platform
-- Run this script to create the necessary tables

USE [freelancing_platform]
GO

-- Drop existing tables if they exist
IF OBJECT_ID('dbo.proposals', 'U') IS NOT NULL DROP TABLE dbo.proposals;
IF OBJECT_ID('dbo.jobs', 'U') IS NOT NULL DROP TABLE dbo.jobs;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;

-- Create users table
CREATE TABLE users (
    id NVARCHAR(50) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    first_name NVARCHAR(100),
    last_name NVARCHAR(100),
    user_type NVARCHAR(20) CHECK (user_type IN ('client', 'freelancer')),
    profile_image_url NVARCHAR(500),
    title NVARCHAR(200),
    bio NVARCHAR(MAX),
    hourly_rate DECIMAL(10,2),
    skills NVARCHAR(MAX),
    location NVARCHAR(200),
    company NVARCHAR(200),
    rating DECIMAL(3,2) DEFAULT 0,
    total_jobs INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Create jobs table
CREATE TABLE jobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    client_id NVARCHAR(50) NOT NULL,
    category NVARCHAR(100) NOT NULL,
    budget_type NVARCHAR(20) CHECK (budget_type IN ('fixed', 'hourly')) DEFAULT 'fixed',
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    hourly_rate DECIMAL(10,2),
    experience_level NVARCHAR(20) CHECK (experience_level IN ('Beginner', 'Intermediate', 'Expert')),
    skills NVARCHAR(MAX),
    status NVARCHAR(20) CHECK (status IN ('draft', 'active', 'closed', 'completed')) DEFAULT 'active',
    remote BIT DEFAULT 1,
    proposal_count INT DEFAULT 0,
    duration NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (client_id) REFERENCES users(id)
);

-- Create proposals table
CREATE TABLE proposals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT NOT NULL,
    freelancer_id NVARCHAR(50) NOT NULL,
    cover_letter NVARCHAR(MAX) NOT NULL,
    proposed_rate DECIMAL(10,2),
    estimated_duration NVARCHAR(50),
    status NVARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id)
);

-- Insert sample users
INSERT INTO users (id, email, first_name, last_name, user_type, company, rating, total_jobs) VALUES 
('client_001', 'john@techcorp.com', 'John', 'Smith', 'client', 'TechCorp Solutions', 4.8, 15),
('client_002', 'sarah@foodapp.com', 'Sarah', 'Johnson', 'client', 'FoodApp Inc', 4.9, 22),
('client_003', 'mike@saascompany.com', 'Mike', 'Wilson', 'client', 'SaaS Company', 4.7, 8),
('client_004', 'lisa@healthcare.com', 'Lisa', 'Brown', 'client', 'Healthcare Solutions', 4.6, 12),
('freelancer_001', 'alex@developer.com', 'Alex', 'Garcia', 'freelancer', NULL, 4.9, 45),
('freelancer_002', 'emma@designer.com', 'Emma', 'Davis', 'freelancer', NULL, 4.8, 32);

-- Insert sample jobs
INSERT INTO jobs (title, description, client_id, category, budget_type, budget_min, budget_max, experience_level, skills, status, remote, duration) VALUES 
('React Developer - E-commerce Platform', 'Build a modern e-commerce platform using React and Node.js with payment integration and user authentication. The project requires expertise in modern web technologies and scalable architecture.', 'client_001', 'Web Development', 'fixed', 2000, 2500, 'Intermediate', '["React", "Node.js", "SQL Server", "Payment Integration"]', 'active', 1, '2-3 months'),
('Mobile App Development - iOS/Android', 'Create a cross-platform mobile application for food delivery with real-time tracking, push notifications, and payment processing. Looking for experienced React Native developer.', 'client_002', 'Mobile Development', 'fixed', 3000, 3500, 'Expert', '["React Native", "Firebase", "Payment Integration", "GPS"]', 'active', 1, '3-4 months'),
('Full-Stack Web Developer', 'Develop a complete SaaS application with dashboard, analytics, user management, and API integrations. Ongoing project with potential for long-term collaboration.', 'client_003', 'Web Development', 'hourly', 40, 60, 'Expert', '["React", "Node.js", "SQL Server", "AWS"]', 'active', 1, '6+ months'),
('UI/UX Designer for Healthcare App', 'Design user interface and experience for a healthcare management application. Must have experience with healthcare compliance and accessibility standards.', 'client_004', 'Design', 'fixed', 1500, 2000, 'Intermediate', '["Figma", "UI Design", "UX Research", "Healthcare"]', 'active', 1, '1-2 months'),
('WordPress Plugin Development', 'Create a custom WordPress plugin for appointment booking with calendar integration and payment processing. Plugin should be scalable and follow WordPress best practices.', 'client_001', 'Web Development', 'fixed', 800, 1200, 'Intermediate', '["WordPress", "PHP", "JavaScript", "Payment Integration"]', 'active', 1, '3-4 weeks'),
('Data Analytics Dashboard', 'Build an interactive analytics dashboard for business intelligence with charts, graphs, and real-time data visualization. Experience with data visualization libraries required.', 'client_003', 'Data Science', 'hourly', 45, 65, 'Expert', '["Python", "React", "D3.js", "SQL", "Data Visualization"]', 'active', 1, '2-3 months');

-- Update proposal counts
UPDATE jobs SET proposal_count = 3 WHERE id = 1;
UPDATE jobs SET proposal_count = 7 WHERE id = 2;
UPDATE jobs SET proposal_count = 12 WHERE id = 3;
UPDATE jobs SET proposal_count = 5 WHERE id = 4;
UPDATE jobs SET proposal_count = 2 WHERE id = 5;
UPDATE jobs SET proposal_count = 8 WHERE id = 6;

-- Insert sample proposals
INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_rate, estimated_duration, status) VALUES 
(1, 'freelancer_001', 'I have extensive experience in React and Node.js development with over 5 years in building e-commerce platforms. I can deliver a high-quality solution within your timeline.', 2300, '2.5 months', 'pending'),
(2, 'freelancer_001', 'Mobile app development is my specialty. I have built several food delivery apps with real-time tracking. I can provide examples of my previous work.', 3200, '3 months', 'pending'),
(3, 'freelancer_002', 'As a full-stack developer with SaaS experience, I understand the complexities involved. I am available for long-term collaboration and can start immediately.', 55, '6+ months', 'accepted');

PRINT 'Database setup completed successfully!';
PRINT 'Tables created: users, jobs, proposals';
PRINT 'Sample data inserted for testing';