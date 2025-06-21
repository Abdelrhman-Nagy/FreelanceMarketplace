import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { Link } from 'wouter';

const ResetPasswordPage: React.FC = () => {
  const [location] = useLocation();
  
  const token = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token') || '';
  }, [location]);

  const handleSuccess = () => {
    // Will redirect to login page automatically
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              The reset link appears to be invalid or missing.
            </p>
            <div className="mt-4">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
        <ResetPasswordForm token={token} onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;