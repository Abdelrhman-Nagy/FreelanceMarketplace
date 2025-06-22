// API configuration utility
export const getApiUrl = (endpoint: string): string => {
  // Check if we're running on the same port as the server
  if (window.location.port === '5000' || window.location.hostname === 'localhost' && window.location.port === '') {
    return endpoint; // Use relative URL
  }
  
  // Otherwise, explicitly point to localhost:5000
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