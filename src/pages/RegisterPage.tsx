import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Link } from 'wouter';

const RegisterPage: React.FC = () => {
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

  const handleRegisterSuccess = () => {
    if (user) {
      const dashboardRoute = getDashboardRoute(user.role);
      setLocation(dashboardRoute);
    } else {
      setLocation('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
};

export default RegisterPage;