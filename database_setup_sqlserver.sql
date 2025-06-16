-- SQL Server Database Setup for Freelancing Platform
-- Run this script to create the database and user

-- Create database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'freelancing_platform')
BEGIN
    CREATE DATABASE freelancing_platform;
END
GO

-- Use the database
USE freelancing_platform;
GO

-- Create login (server-level)
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'app_user')
BEGIN
    CREATE LOGIN app_user WITH PASSWORD = 'Xman@123', CHECK_POLICY = OFF;
END
GO

-- Create user (database-level)
IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'app_user')
BEGIN
    CREATE USER app_user FOR LOGIN app_user;
END
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER app_user;
GO

-- Create sample tables for the freelancing platform
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    user_type NVARCHAR(20) CHECK (user_type IN ('client', 'freelancer')) NOT NULL,
    profile_picture NVARCHAR(500),
    bio NTEXT,
    skills NTEXT, -- JSON array of skills
    hourly_rate DECIMAL(10,2),
    location NVARCHAR(200),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    client_id INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NTEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    category NVARCHAR(100) NOT NULL,
    skills NTEXT, -- JSON array of required skills
    experience_level NVARCHAR(50) CHECK (experience_level IN ('entry', 'intermediate', 'expert')) NOT NULL,
    status NVARCHAR(20) CHECK (status IN ('active', 'closed', 'in_progress')) DEFAULT 'active',
    deadline DATE,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (client_id) REFERENCES users(id)
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    cover_letter NTEXT NOT NULL,
    proposed_rate DECIMAL(10,2) NOT NULL,
    estimated_duration NVARCHAR(100),
    status NVARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id)
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    client_id INT NOT NULL,
    proposal_id INT NOT NULL,
    agreed_rate DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status NVARCHAR(20) CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
    total_paid DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);

-- Insert sample data
-- Sample users
INSERT INTO users (email, password_hash, first_name, last_name, user_type, bio, skills, hourly_rate, location) VALUES
('john.client@example.com', 'hashed_password_1', 'John', 'Doe', 'client', 'Looking for talented developers', NULL, NULL, 'New York, NY'),
('jane.dev@example.com', 'hashed_password_2', 'Jane', 'Smith', 'freelancer', 'Full-stack developer with 5 years experience', '["JavaScript", "React", "Node.js", "PostgreSQL"]', 75.00, 'San Francisco, CA'),
('mike.designer@example.com', 'hashed_password_3', 'Mike', 'Johnson', 'freelancer', 'UI/UX Designer specializing in mobile apps', '["UI Design", "UX Design", "Figma", "Adobe XD"]', 65.00, 'Austin, TX');

-- Sample jobs
INSERT INTO jobs (client_id, title, description, budget, category, skills, experience_level, deadline) VALUES
(1, 'React Developer - E-commerce Platform', 'Build a modern e-commerce platform using React and Node.js', 2500.00, 'Web Development', '["React", "Node.js", "SQL Server"]', 'intermediate', '2025-08-15'),
(1, 'Mobile App Development - iOS/Android', 'Create a cross-platform mobile application for food delivery', 3500.00, 'Mobile Development', '["React Native", "Firebase", "Payment Integration"]', 'expert', '2025-09-30');

-- Sample proposals
INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_rate, estimated_duration) VALUES
(1, 2, 'I have extensive experience in React and Node.js development. I can deliver this project within the timeline.', 2400.00, '6 weeks'),
(2, 2, 'I specialize in React Native development and have built several successful mobile apps.', 3200.00, '8 weeks');

PRINT 'SQL Server database setup completed successfully!';
PRINT 'Database: freelancing_platform';
PRINT 'User: app_user';
PRINT 'Connection: Server=localhost;Database=freelancing_platform;User Id=app_user;Password=Xman@123;Encrypt=true;TrustServerCertificate=true;';