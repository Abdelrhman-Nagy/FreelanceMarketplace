# Production Build Guide

## Build Process Fixed
Created a custom build script (`build.js`) that correctly builds both frontend and backend.

## Build Commands:
```bash
# Custom build (recommended)
node build.js

# Manual build steps
vite build                    # Builds frontend to dist/
esbuild server/index.js --platform=node --packages=external --bundle --format=esm --outfile=dist/server.js
```

## Build Output:
- `dist/index.html` - Frontend entry point
- `dist/assets/` - Frontend assets (CSS, JS)
- `dist/server.js` - Backend server bundle

## Deployment:
1. Run build: `node build.js`
2. Deploy `dist/` folder to your hosting service
3. Run server: `node dist/server.js`

## Port Configuration:
The application uses relative URLs, so it will work on any port where both frontend and backend are served together.

Build script handles the package.json limitation and correctly references the JavaScript server file.