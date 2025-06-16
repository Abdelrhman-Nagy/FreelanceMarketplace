-- Quick PostgreSQL Database Setup for Freelancing Platform

-- 1. Create database (run as postgres superuser)
CREATE DATABASE freelancing_platform;

-- 2. Create application user
CREATE USER app_user WITH PASSWORD 'FreelanceApp2024!';

-- 3. Grant permissions
GRANT ALL PRIVILEGES ON DATABASE freelancing_platform TO app_user;

-- 4. Connect to the new database
\c freelancing_platform;

-- 5. Grant schema permissions
GRANT ALL ON SCHEMA public TO app_user;

-- Done! Database ready for the application