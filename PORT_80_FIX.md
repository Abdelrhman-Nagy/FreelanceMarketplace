# Port 80 Configuration Fix

## Issue
User's frontend runs on localhost:80 but the API server runs on localhost:5000, causing cross-port API request failures.

## Solution Applied
Updated all API requests to always use absolute URLs pointing to localhost:5000:

### Files Modified:
- `src/contexts/AuthContext.tsx` - All auth endpoints now use `http://localhost:5000/api/auth/*`
- `src/lib/queryClient.ts` - All API requests now use `http://localhost:5000/*`
- `src/lib/apiConfig.ts` - Updated URL helper to always use port 5000

### CORS Considerations:
Since the frontend (port 80) and API (port 5000) are on different ports, ensure:
1. The Express server has CORS enabled (already configured)
2. Requests use `credentials: 'include'` for session cookies (already implemented)

### Testing:
1. Start API server: `npm run dev` (runs on port 5000)
2. Access frontend on port 80
3. Authentication should now work correctly with cross-port requests

This fix ensures the frontend always communicates with the API server regardless of which port the frontend is served from.