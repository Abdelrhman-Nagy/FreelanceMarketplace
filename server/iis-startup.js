// IIS-specific startup file for iisnode
// This ensures proper initialization in IIS environment

const path = require('path');

// Set proper working directory
process.chdir(path.dirname(__dirname));

// Import and start the main server
require('./index.js');