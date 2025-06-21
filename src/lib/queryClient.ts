import { QueryClient } from '@tanstack/react-query';

const defaultFetcher = async (url: string): Promise<any> => {
  console.log('Fetching:', url);
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  console.log('Response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('Fetch error:', errorText);
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  console.log('Fetched data:', data);
  return data;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => defaultFetcher(queryKey[0] as string),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchInterval: false,
      enabled: true, // Enable queries by default
    },
  },
});

export const apiRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<any> => {
  // Get user info from localStorage for authentication
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // Add authentication headers if user is logged in
  if (user) {
    headers['x-user-id'] = user.id;
    headers['x-user-type'] = user.userType;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Authentication required. Please log in.');
    }
    
    // Handle authorization errors
    if (response.status === 403) {
      throw new Error(errorData.message || 'Access denied. Insufficient permissions.');
    }
    
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};