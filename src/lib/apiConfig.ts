// API configuration utility
export const getApiUrl = (endpoint: string): string => {
  // Use relative URL - server runs on same port
  return endpoint;
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