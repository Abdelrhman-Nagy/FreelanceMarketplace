// API configuration utility
export const getApiUrl = (endpoint: string): string => {
  // Always use absolute URL to port 5000 for API requests
  return `http://localhost:5000${endpoint}`;
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