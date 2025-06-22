# FreelanceHub - Complete Freelance Marketplace

A modern, full-stack freelance marketplace built with React, Express.js, and PostgreSQL. Features include user authentication, job listings, proposal system, project management, and real-time statistics.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   Create `.env` file:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=development
   SESSION_SECRET=your-session-secret
   JWT_SECRET=your-jwt-secret
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   Open: `http://localhost:5000`

## Features

- **Multi-role Authentication** (Client, Freelancer, Admin)
- **Job Management** (Post, browse, apply)
- **Proposal System** (Submit, review, accept/reject)
- **Project Workspace** (Tasks, messages, file sharing)
- **Contract Management** (Automatic contract creation)
- **Real-time Statistics** (Earnings, job stats, proposals)
- **Responsive Design** (Mobile-friendly interface)

## Test Credentials

- Email: `newuser@test.com`
- Password: `password123`

## Troubleshooting

If login/register returns 404 errors:

1. Ensure server is running on port 5000
2. Access exactly: `http://localhost:5000`
3. Check browser console for error details
4. Verify API endpoints in network tab

For detailed troubleshooting, see `TROUBLESHOOTING.md`

## Project Structure

```
├── server/
│   ├── index.js          # Express server & API routes
│   └── database.js       # Database service & auth
├── src/
│   ├── components/       # React components
│   ├── contexts/        # Authentication context
│   ├── pages/           # Application pages
│   └── hooks/           # Custom hooks
├── shared/
│   └── schema.js        # Database schema
└── dist/                # Production build
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/jobs` - List all jobs
- `GET /api/proposals` - User proposals
- `GET /api/projects` - User projects
- `GET /api/contracts` - User contracts

## Database Schema

Complete PostgreSQL schema included with sample data for:
- Users (clients, freelancers, admins)
- Jobs with categories and skills
- Proposals and contracts
- Projects with tasks and messages
- User sessions and permissions

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt
- **Build**: Vite, ESBuild