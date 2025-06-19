// IIS startup file for the freelancing platform
// This file is used by iisnode to start the Hapi.js server

import('./index.js').catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});