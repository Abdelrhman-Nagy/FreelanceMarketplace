import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'outline', 
  size = 'sm',
  className = ''
}) => {
  const { logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Call logout to destroy session
      await logout();
      
      console.log('Logout completed, redirecting...');
      // Force refresh to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Fallback: just redirect
      window.location.href = '/';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button 
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={`flex items-center ${className}`}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  );
};