# Web.config Updated for Node.js 20.21.0

## Changes Made
Updated the IIS configuration to optimize for Node.js version 20.21.0 with improved performance settings.

## Configuration Updates

### Process Settings
- **nodeProcessCountPerApplication**: Increased from 1 to 2 processes
- **maxConcurrentRequestsPerProcess**: Doubled from 1024 to 2048 requests

### Connection Pool Optimization
- **maxNamedPipeConnectionPoolSize**: Doubled from 512 to 1024
- **maxNamedPipePooledConnectionAge**: Increased from 30s to 60s
- **maxNamedPipeConnectionRetry**: Increased from 3 to 5 attempts
- **namedPipeConnectionRetryDelay**: Reduced from 2000ms to 1500ms

### Buffer and Threading
- **initialRequestBufferSize**: Doubled from 4KB to 8KB
- **maxRequestBufferSize**: Doubled from 64KB to 128KB
- **asyncCompletionThreadCount**: Increased from 0 to 4 threads

### Monitoring and Performance
- **watchedFiles**: Extended to include JSON files (*.js;*.json)
- **uncFileChangesPollingInterval**: Reduced from 5s to 3s
- **gracefulShutdownTimeout**: Reduced from 60s to 30s

### Security and Proxy Support
- **enableXFF**: Enabled for X-Forwarded-For support
- **promoteServerVars**: Added support for forwarded headers

## Benefits
- Better performance with Node.js 20.21.0
- Improved handling of concurrent requests
- Enhanced proxy and load balancer support
- Faster file change detection
- More efficient connection pooling

The configuration is now optimized for Node.js 20.21.0 and should provide better performance for your freelancing platform on IIS.