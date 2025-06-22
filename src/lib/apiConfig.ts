// API configuration utility
export const getApiUrl = (endpoint: string): string => {
  // Always use absolute URL pointing to port 5000 where the API server runs
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