import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/LogoutButton';
import { Briefcase, User, Settings, Menu } from 'lucide-react';

export default function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const getDashboardRoute = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'client':
        return '/client-dashboard';
      case 'freelancer':
        return '/freelancer-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FreelancingPlatform</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/jobs" className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium ${location === '/jobs' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}>
              Browse Jobs
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href={getDashboardRoute()} className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium ${location.includes('dashboard') || location.includes('admin') ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}>
                  Dashboard
                </Link>
                <Link href="/profile" className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium ${location === '/profile' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}>
                  Profile
                </Link>
                {user?.role === 'client' && (
                  <Link href="/post-job" className={`text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium ${location === '/post-job' ? 'text-blue-600 border-b-2 border-blue-600' : ''}`}>
                    Post Job
                  </Link>
                )}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName}!
                  </span>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}