# FreelanceHub Troubleshooting Guide

## Login/Register 404 Errors

### Common Causes:
1. **Wrong URL**: Make sure you're accessing `http://localhost:5000` not another port
2. **Server not running**: Verify server is running with `npm run dev`
3. **Build issues**: Try rebuilding with `npm run build`

### Quick Fixes:

1. **Check Server Status**
   ```bash
   # Should show "Server running on 0.0.0.0:5000"
   npm run dev
   ```

2. **Test API Directly**
   ```bash
   # Test registration endpoint
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","role":"freelancer"}'
   
   # Should return success response
   ```

3. **Verify Frontend URL**
   - Open browser to exactly: `http://localhost:5000`
   - Check browser network tab during login attempt
   - Ensure requests go to `/api/auth/login` not just `/login`

4. **Clear Browser Cache**
   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
   - Clear cookies and local storage
   - Try incognito/private mode

### Database Issues:

1. **Connection Error**
   ```bash
   # Check if DATABASE_URL is set
   echo $DATABASE_URL
   
   # Test database connection
   curl http://localhost:5000/api/test
   ```

2. **Missing Tables**
   - Import the provided database schema
   - Run `npm run db:push` if using Drizzle

### Working Test Credentials:
- Email: `newuser@test.com`
- Password: `password123`

### API Endpoint Reference:
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get profile
- `GET /api/jobs` - List jobs
- `GET /api/test` - Health check