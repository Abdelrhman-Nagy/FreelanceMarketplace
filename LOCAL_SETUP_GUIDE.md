# FreelanceHub Local Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Create a `.env` file in the root directory:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=development
   SESSION_SECRET=your-session-secret-key
   JWT_SECRET=your-jwt-secret-key
   ```

3. **Start the Application**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   Open your browser to: `http://localhost:5000`

## Important Notes

- The application serves both API and frontend from port 5000
- Authentication endpoints are at `/api/auth/login` and `/api/auth/register`
- All static files are served from the `dist/` directory
- Session-based authentication is used for login persistence

## Demo Users

You can test with these credentials:
- Email: `newuser@test.com`
- Password: `password123`

Or register a new account using the registration form.

## Troubleshooting

### 404 Errors on Login/Register
- Ensure you're accessing the app at `http://localhost:5000` (not a different port)
- Check that the server is running with `npm run dev`
- Verify the console shows "Server running on 0.0.0.0:5000"

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify your DATABASE_URL in the .env file
- Check that the database exists and is accessible

### API Endpoints Not Found
- The server handles both API routes and SPA routing
- API routes start with `/api/`
- All other routes serve the React application

## Database Setup

If you need to set up a fresh database:
1. Create a PostgreSQL database
2. Import the included `COMPLETE_DATABASE_EXPORT.sql` file
3. Update your DATABASE_URL in `.env`