# Quick Database Configuration Fix

## The Problem
Your application was failing due to undefined authentication middleware references. This has been fixed by creating a clean server file without authentication dependencies.

Next, you need to configure the DATABASE_URL environment variable.

## The Solution
You need to update the web.config file with your actual PostgreSQL database connection string.

### Step 1: Edit web.config
Open the `web.config` file and find this section:

```xml
<environmentVariables>
  <add name="NODE_ENV" value="production" />
  <add name="DATABASE_URL" value="postgresql://your_username:your_password@localhost:5432/freelancing_platform" />
  <add name="PORT" value="5000" />
</environmentVariables>
```

### Step 2: Update the DATABASE_URL
Replace `postgresql://your_username:your_password@localhost:5432/freelancing_platform` with your actual database connection details:

#### Format:
```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

#### Examples:
```
# If your database is on the same server (localhost)
postgresql://postgres:mypassword@localhost:5432/freelancing_platform

# If your database is on a remote server
postgresql://dbuser:secretpass@192.168.1.100:5432/freelancing_platform

# If using default PostgreSQL port (5432), you can omit it
postgresql://postgres:mypassword@localhost/freelancing_platform
```

### Step 3: Save and Restart
1. Save the web.config file
2. IIS will automatically restart your application
3. Test by visiting your website

### Step 4: Verify Database Setup
Make sure you have:
1. ✅ PostgreSQL installed and running
2. ✅ Created the `freelancing_platform` database
3. ✅ Imported the schema from `database_export.sql`
4. ✅ Verified the username/password can connect

### Test Database Connection
You can test your connection string using psql:
```bash
psql "postgresql://username:password@localhost:5432/freelancing_platform"
```

If this connects successfully, your web.config should work too.

### Common Issues:
- **Wrong password**: Double-check your PostgreSQL password
- **Database doesn't exist**: Create it with `createdb freelancing_platform`
- **PostgreSQL not running**: Start the PostgreSQL service
- **Firewall**: Ensure PostgreSQL port (5432) is accessible
- **SSL issues**: Add `?sslmode=disable` to the connection string if needed

### Alternative: Use .env file instead
If you prefer using a .env file (though web.config is recommended for IIS):
1. Create a `.env` file in your project root
2. Add: `DATABASE_URL=postgresql://username:password@localhost:5432/freelancing_platform`
3. Ensure your application loads environment variables from .env files