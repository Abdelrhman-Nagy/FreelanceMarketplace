-- FreelancingPlatform Database Schema Export
-- Generated on: June 19, 2025
-- Database: PostgreSQL

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS project_messages CASCADE;
DROP TABLE IF EXISTS project_files CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('client', 'freelancer')),
    company TEXT,
    title TEXT,
    skills TEXT, -- JSON array stored as text
    hourly_rate INTEGER, -- stored in cents
    rating DECIMAL(3,2) DEFAULT 0.00,
    profile_image TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    skills TEXT NOT NULL, -- JSON array stored as text
    budget_min INTEGER, -- stored in cents
    budget_max INTEGER, -- stored in cents
    budget_type TEXT DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'hourly')),
    experience_level TEXT DEFAULT 'intermediate' CHECK (experience_level IN ('entry', 'intermediate', 'expert')),
    duration TEXT,
    client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    proposal_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Proposals table
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    proposed_rate INTEGER, -- stored in cents
    estimated_duration TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(job_id, freelancer_id)
);

-- Create Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    freelancer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'cancelled')),
    deadline DATE,
    budget INTEGER, -- stored in cents
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to TEXT REFERENCES users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Project Files table
CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Project Messages table
CREATE TABLE project_messages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Project Members table
CREATE TABLE project_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create Saved Jobs table
CREATE TABLE saved_jobs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Insert sample users (clients and freelancers)
INSERT INTO users (id, email, password_hash, first_name, last_name, user_type, company, title, skills, hourly_rate, rating, bio, location) VALUES 
-- Clients
('client_001', 'sarah.johnson@techcorp.com', '$2b$10$dummy_hash_1', 'Sarah', 'Johnson', 'client', 'TechCorp Solutions', 'Product Manager', NULL, NULL, 4.9, 'Experienced product manager looking for talented developers and designers.', 'San Francisco, CA'),
('client_002', 'michael.chen@startup.io', '$2b$10$dummy_hash_2', 'Michael', 'Chen', 'client', 'InnovateLab', 'CTO', NULL, NULL, 4.7, 'Building the next generation of mobile applications.', 'Austin, TX'),
('client_003', 'emily.davis@designstudio.com', '$2b$10$dummy_hash_3', 'Emily', 'Davis', 'client', 'Creative Design Studio', 'Creative Director', NULL, NULL, 4.8, 'Leading creative projects for Fortune 500 companies.', 'New York, NY'),

-- Freelancers
('freelancer_001', 'alex.rodriguez@email.com', '$2b$10$dummy_hash_4', 'Alex', 'Rodriguez', 'freelancer', NULL, 'Full-Stack Developer', '["JavaScript", "React", "Node.js", "Python", "PostgreSQL", "AWS"]', 7500, 4.9, 'Experienced full-stack developer with 8+ years building scalable web applications.', 'Remote'),
('freelancer_002', 'sophia.kim@email.com', '$2b$10$dummy_hash_5', 'Sophia', 'Kim', 'freelancer', NULL, 'UI/UX Designer', '["Figma", "Adobe Creative Suite", "User Research", "Prototyping", "Wireframing"]', 6000, 4.8, 'Creative designer specializing in user-centered design and brand identity.', 'Los Angeles, CA'),
('freelancer_003', 'james.wilson@email.com', '$2b$10$dummy_hash_6', 'James', 'Wilson', 'freelancer', NULL, 'Mobile Developer', '["React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin"]', 8000, 4.7, 'Mobile app specialist with expertise in cross-platform development.', 'Seattle, WA');

-- Insert sample jobs
INSERT INTO jobs (title, description, category, skills, budget_min, budget_max, budget_type, experience_level, duration, client_id, status, proposal_count) VALUES 
('E-commerce Website Development', 'Need a modern, responsive e-commerce website built with React and Node.js. Must include payment integration, user authentication, and admin dashboard.', 'Web Development', '["React", "Node.js", "PostgreSQL", "Stripe", "AWS"]', 200000, 300000, 'fixed', 'intermediate', '2-3 months', 'client_001', 'open', 3),
('Mobile App UI/UX Design', 'Looking for a talented designer to create a complete UI/UX design for our food delivery mobile application. Need wireframes, prototypes, and final designs.', 'Design', '["Figma", "UI Design", "UX Research", "Prototyping", "Mobile Design"]', 150000, 200000, 'fixed', 'expert', '6-8 weeks', 'client_002', 'open', 2),
('React Native Food Delivery App', 'Develop a cross-platform mobile app for food delivery with real-time tracking, payment integration, and push notifications.', 'Mobile Development', '["React Native", "Firebase", "Maps API", "Push Notifications", "Payment Integration"]', 300000, 500000, 'fixed', 'expert', '3-4 months', 'client_002', 'in_progress', 1),
('Brand Identity & Logo Design', 'Create a complete brand identity package including logo, color palette, typography, and brand guidelines for a new tech startup.', 'Design', '["Branding", "Logo Design", "Adobe Illustrator", "Brand Guidelines", "Typography"]', 80000, 120000, 'fixed', 'intermediate', '3-4 weeks', 'client_003', 'open', 4),
('Python Data Analysis Script', 'Need a Python script to analyze sales data and generate automated reports with visualizations.', 'Data Science', '["Python", "Pandas", "Matplotlib", "Data Analysis", "Reporting"]', 50000, 80000, 'fixed', 'intermediate', '2-3 weeks', 'client_001', 'open', 2),
('WordPress Website Redesign', 'Redesign existing WordPress website with modern design, improved performance, and mobile responsiveness.', 'Web Development', '["WordPress", "PHP", "CSS", "JavaScript", "Responsive Design"]', 100000, 150000, 'fixed', 'entry', '4-5 weeks', 'client_003', 'open', 1);

-- Insert sample proposals
INSERT INTO proposals (job_id, freelancer_id, cover_letter, proposed_rate, estimated_duration, status) VALUES 
(1, 'freelancer_001', 'I have extensive experience building e-commerce platforms with React and Node.js. I can deliver a high-quality, scalable solution within your timeline.', 250000, '10 weeks', 'pending'),
(1, 'freelancer_003', 'While I specialize in mobile development, I also have strong web development skills and would love to work on this project.', 220000, '12 weeks', 'pending'),
(2, 'freelancer_002', 'As a UI/UX specialist, I can create an intuitive and beautiful design for your food delivery app. My portfolio includes similar projects.', 180000, '7 weeks', 'accepted'),
(3, 'freelancer_001', 'I can build your React Native app with all the features you need. I have experience with real-time tracking and payment systems.', 400000, '14 weeks', 'accepted'),
(4, 'freelancer_002', 'Brand identity is my passion! I will create a memorable and professional brand that resonates with your target audience.', 100000, '4 weeks', 'pending'),
(5, 'freelancer_001', 'Python data analysis is one of my core skills. I can create automated reports with beautiful visualizations.', 60000, '3 weeks', 'pending');

-- Insert sample projects
INSERT INTO projects (title, description, client_id, freelancer_id, job_id, status, deadline, budget) VALUES 
('E-commerce Platform Development', 'React-based e-commerce platform with payment integration and user management system', 'client_001', 'freelancer_001', 1, 'in_progress', '2025-09-15', 250000),
('Food Delivery Mobile App', 'Cross-platform mobile application with real-time tracking and payment processing', 'client_002', 'freelancer_001', 3, 'active', '2025-10-30', 400000),
('SaaS Platform UI/UX Design', 'Complete user interface and user experience design for new SaaS platform', 'client_001', 'freelancer_002', 2, 'in_progress', '2025-08-10', 180000);

-- Insert sample project members
INSERT INTO project_members (project_id, user_id, role) VALUES 
(1, 'client_001', 'owner'),
(1, 'freelancer_001', 'admin'),
(2, 'client_002', 'owner'),
(2, 'freelancer_001', 'admin'),
(3, 'client_001', 'owner'),
(3, 'freelancer_002', 'admin');

-- Insert sample tasks
INSERT INTO tasks (project_id, title, description, assigned_to, status, priority, due_date) VALUES 
(1, 'Setup Project Structure', 'Initialize React project with proper folder structure and dependencies', 'freelancer_001', 'completed', 'high', '2025-06-25'),
(1, 'User Authentication System', 'Implement login, registration, and password reset functionality', 'freelancer_001', 'in_progress', 'high', '2025-07-05'),
(1, 'Product Catalog Design', 'Design and implement product listing and detail pages', 'freelancer_001', 'todo', 'medium', '2025-07-15'),
(1, 'Payment Integration', 'Integrate Stripe payment processing system', 'freelancer_001', 'todo', 'high', '2025-07-25'),
(2, 'Mobile App Framework Setup', 'Setup React Native development environment and basic navigation', 'freelancer_001', 'completed', 'high', '2025-06-30'),
(2, 'GPS Tracking Implementation', 'Implement real-time location tracking for delivery', 'freelancer_001', 'in_progress', 'medium', '2025-07-10'),
(2, 'Order Management System', 'Create order placement and tracking system', 'freelancer_001', 'todo', 'high', '2025-07-20'),
(3, 'User Research & Personas', 'Conduct user research and create user personas', 'freelancer_002', 'completed', 'medium', '2025-06-28'),
(3, 'Wireframe Creation', 'Create detailed wireframes for all major screens', 'freelancer_002', 'in_progress', 'high', '2025-07-08'),
(3, 'High-Fidelity Prototypes', 'Design interactive prototypes in Figma', 'freelancer_002', 'todo', 'high', '2025-07-18');

-- Insert sample project messages
INSERT INTO project_messages (project_id, sender_id, message, message_type) VALUES 
(1, 'client_001', 'Welcome to the E-commerce Platform project! Looking forward to working together.', 'text'),
(1, 'freelancer_001', 'Thanks! I''ve setup the initial project structure. You can review it in the repository.', 'text'),
(1, 'client_001', 'Great work on the setup. For the authentication system, please ensure we have social login options.', 'text'),
(1, 'freelancer_001', 'Absolutely! I''ll include Google and Facebook authentication alongside the standard email/password.', 'text'),
(2, 'client_002', 'Excited to get started on the food delivery app. The market research shows great potential.', 'text'),
(2, 'freelancer_001', 'I''ve completed the framework setup. Next step is implementing the GPS tracking feature.', 'text'),
(3, 'client_001', 'The user research insights are very valuable. Looking forward to seeing the wireframes.', 'text'),
(3, 'freelancer_002', 'Working on the wireframes now. Should have the first draft ready by end of week.', 'text');

-- Insert sample saved jobs
INSERT INTO saved_jobs (user_id, job_id) VALUES 
('freelancer_001', 1),
('freelancer_001', 3),
('freelancer_002', 2),
('freelancer_002', 4);

-- Create indexes for better performance
CREATE INDEX idx_jobs_client_id ON jobs(client_id);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_freelancer_id ON projects(freelancer_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_project_messages_project_id ON project_messages(project_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_username;

-- Database creation completed successfully
-- This schema includes:
-- - Users (clients and freelancers)
-- - Jobs with categorization and budget ranges
-- - Proposals with status tracking
-- - Projects with team collaboration
-- - Tasks with priority and status management
-- - Project messages for communication
-- - Project members for team management
-- - File uploads tracking
-- - Saved jobs for freelancers
-- - Proper foreign key relationships
-- - Performance indexes
-- - Auto-updating timestamps
-- - Sample data for testing

SELECT 'FreelancingPlatform Database Schema Created Successfully!' as message;