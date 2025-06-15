#!/bin/bash

# Database Export Script for Freelancing Platform
# This script provides multiple methods to export your Replit PostgreSQL database

echo "=== Database Export Options ==="
echo "1. Full database dump (schema + data)"
echo "2. Schema only"
echo "3. Data only"
echo "4. Table-by-table export"
echo "5. CSV exports"
echo ""

# Method 1: Full database dump
echo "Method 1: Creating full database dump..."
pg_dump $DATABASE_URL \
  --no-owner \
  --no-acl \
  --verbose \
  --file=freelancing_platform_full.sql

# Method 2: Schema only
echo "Method 2: Creating schema-only dump..."
pg_dump $DATABASE_URL \
  --schema-only \
  --no-owner \
  --no-acl \
  --file=freelancing_platform_schema.sql

# Method 3: Data only
echo "Method 3: Creating data-only dump..."
pg_dump $DATABASE_URL \
  --data-only \
  --no-owner \
  --no-acl \
  --file=freelancing_platform_data.sql

# Method 4: Individual table exports
echo "Method 4: Exporting individual tables..."
mkdir -p table_exports

# Export each table
TABLES=("users" "jobs" "proposals" "messages" "contracts" "admin_stats" "user_suspensions" "sessions")

for table in "${TABLES[@]}"; do
    echo "Exporting table: $table"
    pg_dump $DATABASE_URL \
      --table=$table \
      --no-owner \
      --no-acl \
      --file=table_exports/${table}.sql
done

# Method 5: CSV exports for data analysis
echo "Method 5: Creating CSV exports..."
mkdir -p csv_exports

# Export tables as CSV
psql $DATABASE_URL -c "\COPY users TO 'csv_exports/users.csv' WITH CSV HEADER;"
psql $DATABASE_URL -c "\COPY jobs TO 'csv_exports/jobs.csv' WITH CSV HEADER;"
psql $DATABASE_URL -c "\COPY proposals TO 'csv_exports/proposals.csv' WITH CSV HEADER;"
psql $DATABASE_URL -c "\COPY messages TO 'csv_exports/messages.csv' WITH CSV HEADER;"
psql $DATABASE_URL -c "\COPY contracts TO 'csv_exports/contracts.csv' WITH CSV HEADER;"
psql $DATABASE_URL -c "\COPY admin_stats TO 'csv_exports/admin_stats.csv' WITH CSV HEADER;"

echo ""
echo "=== Export Complete ==="
echo "Files created:"
echo "- freelancing_platform_full.sql (complete database)"
echo "- freelancing_platform_schema.sql (structure only)"
echo "- freelancing_platform_data.sql (data only)"
echo "- table_exports/ (individual table dumps)"
echo "- csv_exports/ (CSV files for analysis)"
echo ""
echo "To download files from Replit:"
echo "1. Use the file manager to download individual files"
echo "2. Or create a zip archive: zip -r database_export.zip *.sql table_exports csv_exports"