// Main entry point for IIS deployment
// This file is referenced in web.config for API routing

const app = require('./server/index.js');

// Export the Express app for iisnode
module.exports = app;