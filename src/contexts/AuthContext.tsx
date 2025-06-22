import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'client' | 'freelancer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: UserStatus;
  company?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  timezone?: string;
  phoneNumber?: string;
  website?: string;
  portfolio?: string;
  experience?: 'entry' | 'intermediate' | 'expert';
  rating?: number;
  totalJobs?: number;
  completedJobs?: number;
  totalEarnings?: number;
  lastLoginAt?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  hourlyRate?: number;
  location?: string;
  experience?: 'entry' | 'intermediate' | 'expert';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const apiUrl = window.location.port === '5000' ? '/api/auth/profile' : 'http://localhost:5000/api/auth/profile';
      const response = await fetch(apiUrl, {
        credentials: 'include'
      });

      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          if (data.status === 'success') {
            setUser(data.user);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear any existing user data on auth failure
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const apiUrl = window.location.port === '5000' ? '/api/auth/login' : 'http://localhost:5000/api/auth/login';
      console.log('Attempting login to:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Login response data:', data);

      if (data.status === 'success') {
        setUser(data.user);
        console.log('Login successful, user set:', data.user);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const apiUrl = window.location.port === '5000' ? '/api/auth/register' : 'http://localhost:5000/api/auth/register';
      console.log('Attempting registration to:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Registration response data:', data);

      if (data.status === 'success') {
        setUser(data.user);
        console.log('Registration successful, user set:', data.user);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthContext logout called');
    try {
      // Call logout endpoint to destroy session
      const apiUrl = window.location.port === '5000' ? '/api/auth/logout' : 'http://localhost:5000/api/auth/logout';
      await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    
    // Clear local state
    setUser(null);
    setLoading(false);
    
    console.log('Logout completed');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const apiUrl = window.location.port === '5000' ? '/api/auth/profile' : 'http://localhost:5000/api/auth/profile';
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setUser(result.user);
      } else {
        throw new Error(result.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user;

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Add specific permission logic here
    // This would typically check against user permissions from the database
    return false;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};