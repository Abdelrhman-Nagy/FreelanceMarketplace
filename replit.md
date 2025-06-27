# FreelanceHub - Complete Freelance Marketplace Platform

## Overview

FreelanceHub is a comprehensive full-stack freelance marketplace platform built with React, Express.js, and PostgreSQL. The platform connects clients with freelancers through a sophisticated job posting and proposal system, featuring user authentication, project management, and administrative controls.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (TanStack) for server state management
- **Styling**: Tailwind CSS with Radix UI components
- **Authentication**: Context-based authentication with session management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication with bcrypt password hashing
- **API Design**: RESTful API with role-based access control
- **File Structure**: Modular server setup with dedicated route handlers

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL
- **Schema**: 18 tables covering users, jobs, proposals, projects, contracts, messaging, and admin functionality
- **Key Features**: Job approval workflow, direct messaging, admin moderation, session management
- **Relationships**: Comprehensive foreign key relationships with cascade delete
- **Indexing**: Optimized queries for performance
- **Export**: Complete schema available in DATABASE_SCHEMA_COMPLETE_v2.sql

## Key Components

### User Management System
- **Multi-role Support**: Admin, Client, and Freelancer roles
- **Authentication**: Secure login/logout with session persistence
- **Profile Management**: Comprehensive user profiles with skills, experience, and portfolio
- **Admin Controls**: User approval, suspension, and management capabilities

### Job & Proposal System
- **Job Posting**: Clients can post detailed job listings with budgets and requirements
- **Job Browsing**: Searchable and filterable job listings
- **Proposal Submission**: Freelancers can submit detailed proposals with cover letters
- **Proposal Management**: Clients can review, accept, or reject proposals

### Project Management
- **Project Creation**: Automatic project creation from accepted proposals
- **Task Management**: Built-in task tracking and assignment
- **Communication**: Project-based messaging system
- **File Management**: File upload and sharing capabilities

### Contract & Payment System
- **Contract Generation**: Automatic contract creation from accepted proposals
- **Status Tracking**: Comprehensive contract status management
- **Payment Integration**: Foundation for payment processing

## Data Flow

### Authentication Flow
1. User submits login credentials
2. Server validates against database
3. Session created and stored
4. User context updated throughout application
5. Protected routes validate session status

### Job Application Flow
1. Client posts job with requirements
2. Job appears in searchable listings
3. Freelancers submit proposals
4. Client reviews and accepts/rejects proposals
5. Accepted proposals become active contracts
6. Projects are created for collaboration

### Project Management Flow
1. Contract creation triggers project setup
2. Tasks can be created and assigned
3. Team members collaborate through messaging
4. Files are shared within project context
5. Progress is tracked through task completion

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Components**: Radix UI component library
- **Styling**: Tailwind CSS, class-variance-authority
- **Forms**: React Hook Form with Zod validation
- **Database**: Drizzle ORM, PostgreSQL driver
- **Authentication**: bcryptjs for password hashing
- **Development**: Vite, TypeScript, ESLint

### Optional Integrations
- **Email Service**: SendGrid integration for notifications
- **File Storage**: Prepared for cloud storage integration
- **Payment Processing**: Architecture ready for Stripe/PayPal integration

## Deployment Strategy

### Development Setup
- **Port Configuration**: Flexible port handling with automatic detection
- **Environment Variables**: Comprehensive .env configuration
- **Database Setup**: Complete schema export available
- **Local Development**: Single command startup with `npm run dev`

### Production Deployment
- **Build Process**: Vite build for frontend, Node.js for backend
- **Static Serving**: Express serves both API and static files
- **Database Migration**: Drizzle migrations for schema updates
- **Environment Flexibility**: Works on any port configuration

### Replit Deployment
- **Modules**: Configured for nodejs-20, web, and postgresql-16
- **Auto-deployment**: Automatic scaling with build and start scripts
- **Port Handling**: Optimized for Replit's port forwarding

## Recent Changes

- June 27, 2025: ✅ COMPLETE PORT 80 CONFIGURATION - Removed ALL port 5000 dependencies
- June 27, 2025: ✅ Updated server to run entirely on port 80 (server/index.js)
- June 27, 2025: ✅ Converted all authentication endpoints to relative URLs
- June 27, 2025: ✅ Fixed database column references (profile_image)
- June 27, 2025: ✅ Verified authentication system working on port 80
- June 24, 2025: Implemented dual approval workflow for user registration and job posting
- June 24, 2025: Enhanced admin dashboard with user and job approval management

## Changelog

- June 24, 2025: Initial setup
- June 24, 2025: Complete marketplace functionality with approval workflow

## User Preferences

Preferred communication style: Simple, everyday language.
Port configuration: Everything runs on port 80 (single port setup).