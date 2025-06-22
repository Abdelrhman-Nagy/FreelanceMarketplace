// API configuration utility
export const getApiUrl = (endpoint: string): string => {
  // Smart port detection: use relative URLs when on port 5000, absolute URLs otherwise
  return window.location.port === '5000' ? endpoint : `http://localhost:5000${endpoint}`;
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