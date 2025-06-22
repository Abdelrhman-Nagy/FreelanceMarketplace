# Relative URLs Only Configuration

## Changes Applied
Removed all hardcoded ports and window.location.port logic. The application now uses only relative URLs.

## Files Updated:
- `src/contexts/AuthContext.tsx` - All endpoints use relative paths `/api/auth/*`
- `src/lib/queryClient.ts` - All API requests use relative paths
- `src/lib/apiConfig.ts` - Helper returns relative URLs only

## All API Endpoints Now Use:
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/profile`
- `/api/auth/logout`
- `/api/jobs`
- `/api/proposals`
- All other endpoints follow the same pattern

## How It Works:
The frontend and backend must run on the same port for this configuration to work. All API requests will go to the same host and port where the frontend is served from.

## Setup Requirements:
The server must be configured to serve both:
1. Static frontend files
2. API routes at `/api/*`

This is already configured in the Express server setup.

✓ Complete removal of all port references
✓ All endpoints use relative URLs only
✓ Ready for any port configuration

Export: `freelancehub-no-ports.tar.gz`