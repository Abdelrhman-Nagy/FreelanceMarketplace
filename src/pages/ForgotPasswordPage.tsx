import React from 'react';
import { useLocation } from 'wouter';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { Link } from 'wouter';

const ForgotPasswordPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    // Stay on the page to show the reset token (in development)
    // In production, this would redirect to a success page
  };

  const handleCancel = () => {
    setLocation('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
        <ForgotPasswordForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;