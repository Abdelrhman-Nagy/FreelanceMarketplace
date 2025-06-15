# Database Export Guide for Your Freelancing Platform

## Available Export Methods

### 1. Command Line Export (Recommended)
```bash
# Full database export
pg_dump $DATABASE_URL --no-owner --no-acl -f freelancing_platform.sql

# Schema only
pg_dump $DATABASE_URL --schema-only --no-owner --no-acl -f schema_only.sql

# Data only  
pg_dump $DATABASE_URL --data-only --no-owner --no-acl -f data_only.sql
```

### 2. Table-by-Table Export
```bash
# Export specific tables
pg_dump $DATABASE_URL --table=users --no-owner --no-acl -f users_table.sql
pg_dump $DATABASE_URL --table=jobs --no-owner --no-acl -f jobs_table.sql
pg_dump $DATABASE_URL --table=proposals --no-owner --no-acl -f proposals_table.sql
```

### 3. CSV Export for Data Analysis
```bash
# Create CSV files
psql $DATABASE_URL -c "\COPY users TO STDOUT WITH CSV HEADER" > users.csv
psql $DATABASE_URL -c "\COPY jobs TO STDOUT WITH CSV HEADER" > jobs.csv
psql $DATABASE_URL -c "\COPY proposals TO STDOUT WITH CSV HEADER" > proposals.csv
```

### 4. Using the Export Script
```bash
# Run the complete export script
./export_database.sh
```

## Your Database Structure

Current tables in your database:
- `admin_stats` - Platform statistics
- `contracts` - Active contracts between clients and freelancers
- `jobs` - Job postings
- `messages` - Communication between users
- `proposals` - Freelancer proposals on jobs
- `sessions` - User session data
- `user_suspensions` - Admin suspension records
- `users` - User accounts (clients, freelancers, admins)

## Download Options

1. **Individual Files**: Use Replit's file manager to download SQL files
2. **Compressed Archive**: Create a zip file containing all exports
3. **Direct Copy**: Copy SQL content from files for use elsewhere

## Important Notes

- All exports exclude ownership and access control lists for portability
- The `DATABASE_URL` environment variable contains your connection string
- Large tables may take time to export
- Profile images and file data are included as base64 in exports

## Restore Instructions

To restore on another PostgreSQL instance:
```bash
# Create new database
createdb freelancing_platform_restored

# Restore from export
psql freelancing_platform_restored < freelancing_platform.sql
```