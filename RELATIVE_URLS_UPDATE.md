# Relative URLs Configuration

## Changes Applied
Removed hardcoded port 5000 from all API endpoints. Now using relative URLs that work with any port configuration.

## Updated Files:
- `src/contexts/AuthContext.tsx` - All auth endpoints now use relative paths
- `src/lib/queryClient.ts` - All API requests use relative paths  
- `src/lib/apiConfig.ts` - Updated helper to return relative URLs

## API Endpoints Now Use:
- `/api/auth/login` (instead of `http://localhost:5000/api/auth/login`)
- `/api/auth/register` (instead of `http://localhost:5000/api/auth/register`)
- `/api/auth/profile` (instead of `http://localhost:5000/api/auth/profile`)
- `/api/auth/logout` (instead of `http://localhost:5000/api/auth/logout`)
- All other API calls follow the same pattern

## How It Works:
The application will now make API requests to the same host and port where the frontend is served from. This means:
- If served from `http://localhost:80`, APIs go to `http://localhost:80/api/*`
- If served from `http://localhost:5000`, APIs go to `http://localhost:5000/api/*`
- Works with any port configuration automatically

## Requirements:
The backend server must serve both the frontend files AND handle the API routes on the same port for this configuration to work properly.