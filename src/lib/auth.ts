// Simple localStorage-based authentication helper
export interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userType: string;
  company?: string;
  title?: string;
}

export const authStorage = {
  setUser: (user: StoredUser) => {
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  },

  getUser: (): StoredUser | null => {
    try {
      const userData = localStorage.getItem('auth_user');
      const timestamp = localStorage.getItem('auth_timestamp');
      
      if (!userData || !timestamp) return null;
      
      // Check if data is too old (24 hours)
      const age = Date.now() - parseInt(timestamp);
      if (age > 24 * 60 * 60 * 1000) {
        authStorage.clearUser();
        return null;
      }
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      authStorage.clearUser();
      return null;
    }
  },

  clearUser: () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_timestamp');
  },

  isAuthenticated: (): boolean => {
    return authStorage.getUser() !== null;
  }
};