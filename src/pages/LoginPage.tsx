import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { Link } from 'wouter';

const LoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const dashboardRoute = getDashboardRoute(user.role);
      setLocation(dashboardRoute);
    }
  }, [isAuthenticated, user, setLocation]);

  const getDashboardRoute = (role: string) => {
    switch (role) {
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

  const handleLoginSuccess = () => {
    if (user) {
      const dashboardRoute = getDashboardRoute(user.role);
      setLocation(dashboardRoute);
    } else {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </Link>
          </p>
        </div>
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;