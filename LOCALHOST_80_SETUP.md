# Setup for Frontend on Port 80, API on Port 5000

## Configuration Applied
All API requests now use absolute URLs pointing to `http://localhost:5000` regardless of frontend port.

## Required Setup

1. **Start API Server**
   ```bash
   npm run dev
   ```
   This runs the API server on port 5000.

2. **Serve Frontend on Port 80**
   Use any web server to serve the `dist/` folder on port 80:
   
   **Option 1: Python**
   ```bash
   cd dist
   sudo python -m http.server 80
   ```
   
   **Option 2: Node.js serve**
   ```bash
   npm install -g serve
   sudo serve -s dist -l 80
   ```
   
   **Option 3: Apache/Nginx**
   Configure your web server to serve the `dist/` directory.

3. **CORS is Configured**
   The Express server already allows cross-origin requests from any port.

## How It Works
- Frontend: `http://localhost` (port 80)
- API: `http://localhost:5000`
- All authentication and API calls automatically route to port 5000
- Session cookies work across ports with proper CORS settings

## Test Credentials
- Email: `newuser@test.com`
- Password: `password123`

The application will now work correctly with this port configuration.