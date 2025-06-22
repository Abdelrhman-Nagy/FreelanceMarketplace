# Smart Port Detection Solution

## Problem Solved
Frontend on port 80 needs to communicate with API server on port 5000.

## Solution Implementation
Smart port detection logic that automatically determines the correct API endpoint:

### Port Detection Logic:
- **When frontend runs on port 5000**: Use relative URLs (`/api/auth/login`)
- **When frontend runs on any other port**: Use absolute URLs (`http://localhost:5000/api/auth/login`)

### Files Updated:
- `src/contexts/AuthContext.tsx` - Smart detection for all auth endpoints
- `src/lib/queryClient.ts` - Smart detection for all API requests
- `src/lib/apiConfig.ts` - Updated helper function
- `server/index.js` - Enhanced CORS for cross-port requests

### How It Works:
```javascript
const apiUrl = window.location.port === '5000' 
  ? '/api/auth/login' 
  : 'http://localhost:5000/api/auth/login';
```

### Configuration:
- **Frontend on port 5000**: APIs work with relative URLs
- **Frontend on port 80**: APIs automatically redirect to port 5000
- **Any other port**: APIs automatically redirect to port 5000

This solution provides maximum flexibility for any deployment scenario while maintaining proper authentication flow.