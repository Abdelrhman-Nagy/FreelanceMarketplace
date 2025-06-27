// API configuration utility
export const getApiUrl = (endpoint: string): string => {
  // Smart API URL detection for local development
  const currentPort = window.location.port;
  
  if (currentPort === '5000') {
    // If running on port 5000, use relative URLs
    return endpoint;
  } else {
    // If running on any other port, use absolute URLs to port 5000
    return `http://localhost:5000${endpoint}`;
  }
};

export const apiEndpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile'
  },
  jobs: '/api/jobs',
  proposals: '/api/proposals',
  projects: '/api/projects',
  contracts: '/api/contracts'
};