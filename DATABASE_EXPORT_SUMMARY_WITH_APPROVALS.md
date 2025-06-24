# FreelanceHub Database Export - With Approval Workflow

## Export Date
June 24, 2025

## Files Generated
1. `CURRENT_DATABASE_SCHEMA_WITH_APPROVALS.sql` - Complete schema with approval workflow
2. `DATABASE_EXPORT_SUMMARY_WITH_APPROVALS.md` - Documentation of changes

## New Features Added
### Dual Approval Workflow
- **User Registration Approval**: All new user registrations require admin approval
- **Job Posting Approval**: All new job postings require admin approval before appearing on Browse Jobs page

### Database Schema Changes
#### Users Table - New Approval Columns
- `approval_status` text DEFAULT 'pending' - Status: pending/approved/rejected
- `approved_by` text - Admin ID who approved/rejected
- `approved_at` timestamp - When approval/rejection occurred
- `rejection_reason` text - Reason for rejection (if applicable)

#### Jobs Table - New Approval Columns  
- `approval_status` text DEFAULT 'pending' - Status: pending/approved/rejected
- `approved_by` text - Admin ID who approved/rejected
- `approved_at` timestamp - When approval/rejection occurred
- `rejection_reason` text - Reason for rejection (if applicable)

## Workflow Details
### User Registration
1. New users register with approval_status = 'pending'
2. Admin reviews in User Management modal
3. Admin can approve ✓ or reject ✗ with reason
4. Only approved users can login

### Job Posting
1. New jobs posted with approval_status = 'pending'
2. Admin reviews in Job Moderation modal
3. Admin can approve ✓ or reject ✗ with reason
4. Only approved jobs appear on Browse Jobs page

### Admin Dashboard Features
- User Management: View all users with approval status
- Job Moderation: Review and approve/reject job postings
- Real-time statistics for approved content
- Search and filter capabilities

## Database Tables (16 Total)
1. users - User accounts with approval workflow
2. jobs - Job postings with approval workflow
3. proposals - Freelancer proposals
4. contracts - Accepted proposals become contracts
5. projects - Project management
6. tasks - Task tracking within projects
7. project_files - File management
8. project_messages - Project communication
9. project_members - Project team members
10. user_sessions - Session management
11. user_permissions - Permission system
12. password_reset_tokens - Password reset functionality
13. saved_jobs - User job bookmarks
14. messages - Direct messaging system
15. *Additional system tables*

## Key Features Included
- Complete user authentication system
- Multi-role support (admin/client/freelancer)
- Job posting and browsing
- Proposal submission and management
- Project collaboration tools
- Direct messaging system
- Admin moderation capabilities
- **NEW: Dual approval workflow for users and jobs**

## Usage Notes
- Existing users/jobs were set to 'approved' status for continuity
- New registrations and job postings require admin approval
- Admin can manage all aspects through comprehensive dashboard
- All approval actions are tracked with admin ID and timestamps

## Restoration Instructions
```bash
# Schema only
psql $DATABASE_URL < COMPLETE_DATABASE_SCHEMA_WITH_APPROVALS.sql

# Complete database with data
psql $DATABASE_URL < COMPLETE_DATABASE_WITH_DATA_AND_APPROVALS.sql
```