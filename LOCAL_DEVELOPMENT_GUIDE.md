# FreelanceHub - Local Development Setup Guide

## Quick Start

1. **Start the server:**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Access the application:**
   - Open your browser to exactly: `http://localhost:5000`
   - Do NOT use port 80 or any other port

## Test Accounts

The following pre-approved test accounts are available:

### Admin Account
- **Email:** `admin@freelancehub.com`
- **Password:** `password`
- **Role:** Admin (can approve users and jobs)

### Client Account
- **Email:** `client@test.com`
- **Password:** `password`
- **Role:** Client (can post jobs and hire freelancers)

### Freelancer Account
- **Email:** `freelancer@test.com`
- **Password:** `password`
- **Role:** Freelancer (can apply for jobs)

## Smart Port Detection

The application automatically detects your setup:

- **If accessed via port 5000:** Uses relative URLs (`/api/auth/login`)
- **If accessed via any other port:** Uses absolute URLs (`http://localhost:5000/api/auth/login`)

## Common Issues & Solutions

### Login/Register Errors

1. **404 Errors on authentication:**
   - Make sure you're accessing `http://localhost:5000` exactly
   - Check browser console for error details
   - Verify the server is running with `npm run dev`

2. **CORS Errors:**
   - The app handles cross-port requests automatically
   - If you see CORS errors, restart the server

3. **500 Internal Server Errors:**
   - Check server logs in the terminal
   - Verify database connection is working
   - Test with: `curl http://localhost:5000/api/test`

### Database Issues

1. **Test database connection:**
   ```bash
   curl http://localhost:5000/api/test
   ```

2. **If users don't exist:**
   The app automatically creates test users on startup

## Development Workflow

1. **For new user registration:**
   - Users register with status "pending"
   - Admin must approve before they can login
   - Use admin account to approve new users

2. **For job posting:**
   - Jobs are posted with status "pending"
   - Admin must approve before jobs appear publicly
   - Use admin account to approve new jobs

## Troubleshooting Steps

1. **Clear browser cache and cookies**
2. **Use browser developer tools to check network requests**
3. **Verify server is running on port 5000**
4. **Test API endpoints directly with curl**
5. **Check browser console for error messages**

## API Endpoints

- `GET /api/test` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

## Success Indicators

When everything is working correctly:
- Browser console shows successful API requests
- Login/register forms work without errors
- User profile loads after authentication
- No 404 or 500 errors in network tab

The application includes comprehensive error logging to help diagnose any issues.