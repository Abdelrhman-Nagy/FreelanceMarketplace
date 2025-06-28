import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Briefcase, 
  User, 
  Settings, 
  Menu, 
  X, 
  Plus, 
  Search, 
  Star,
  Shield,
  Users,
  ChevronDown,
  DollarSign,
  CreditCard
} from 'lucide-react';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'client':
        return <Briefcase className="h-4 w-4" />;
      case 'freelancer':
        return <Star className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'client':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'freelancer':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Briefcase className="h-8 w-8 text-blue-600 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FreelanceHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Browse Jobs */}
            <Link href="/jobs">
              <div className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group ${
                location === '/jobs' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}>
                <div className="flex items-center space-x-1">
                  <Search className="h-4 w-4" />
                  <span>Browse Jobs</span>
                </div>
                {location === '/jobs' && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Dashboard */}
                <Link href={getDashboardRoute()}>
                  <div className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    location.includes('dashboard') || location.includes('admin')
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon()}
                      <span>Dashboard</span>
                    </div>
                    {(location.includes('dashboard') || location.includes('admin')) && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </Link>

                {/* Post Job - Only for Clients */}
                {user?.role === 'client' && (
                  <Link href="/post-job">
                    <div className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      location === '/post-job'
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-1">
                        <Plus className="h-4 w-4" />
                        <span>Post Job</span>
                      </div>
                      {location === '/post-job' && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getRoleColor()}`}>
                          {getRoleIcon()}
                        </div>
                      </div>
                      <div className="hidden lg:block text-left">
                        <div className="text-sm font-medium text-gray-900">{user?.firstName}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor()}`}>
                          {user?.role}
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                            <div className="text-sm text-gray-500">{user?.email}</div>
                            <Badge className={`mt-1 ${getRoleColor()}`}>
                              {getRoleIcon()}
                              <span className="ml-1">{user?.role}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link href="/profile">
                          <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                            <User className="h-4 w-4 mr-3" />
                            Profile Settings
                          </div>
                        </Link>
                        
                        {user?.role === 'freelancer' && (
                          <Link href="/saved-jobs">
                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                              <Star className="h-4 w-4 mr-3" />
                              Saved Jobs
                            </div>
                          </Link>
                        )}
                        
                        <Link href="/contracts">
                          <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                            <Briefcase className="h-4 w-4 mr-3" />
                            My Contracts
                          </div>
                        </Link>
                        
                        {user?.role === 'client' && (
                          <Link href="/projects">
                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                              <Briefcase className="h-4 w-4 mr-3" />
                              My Projects
                            </div>
                          </Link>
                        )}
                        
                        {user?.role === 'admin' && (
                          <Link href="/admin">
                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                              <Shield className="h-4 w-4 mr-3" />
                              Admin Panel
                            </div>
                          </Link>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-100 py-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 transition-transform duration-200" />
              ) : (
                <Menu className="h-5 w-5 transition-transform duration-200" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2">
            <Link href="/jobs">
              <div className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                location === '/jobs' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}>
                <Search className="h-5 w-5" />
                <span className="font-medium">Browse Jobs</span>
              </div>
            </Link>

            {isAuthenticated ? (
              <>
                <Link href={getDashboardRoute()}>
                  <div className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                    location.includes('dashboard') || location.includes('admin')
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    {getRoleIcon()}
                    <span className="font-medium">Dashboard</span>
                  </div>
                </Link>

                {user?.role === 'client' && (
                  <Link href="/post-job">
                    <div className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                      location === '/post-job' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                      <Plus className="h-5 w-5" />
                      <span className="font-medium">Post Job</span>
                    </div>
                  </Link>
                )}

                <Link href="/profile">
                  <div className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                    location === '/profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}>
                    <User className="h-5 w-5" />
                    <span className="font-medium">Profile</span>
                  </div>
                </Link>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                      <Badge className={`${getRoleColor()}`}>
                        {getRoleIcon()}
                        <span className="ml-1">{user?.role}</span>
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 mt-2"
                  >
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start hover:bg-blue-50 hover:text-blue-600">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}