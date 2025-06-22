import { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, Lock } from 'lucide-react';
import { Link } from 'wouter';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  fallback?: ReactNode;
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, hasRole } = useAuth();

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please log in to access this page.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/login">
                <Button>Log In</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground">
              Required role: <span className="font-medium">{requiredRole}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Your role: <span className="font-medium">{user?.userType || 'None'}</span>
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const ClientOnlyRoute = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <ProtectedRoute requiredRole="client" fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const FreelancerOnlyRoute = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <ProtectedRoute requiredRole="freelancer" fallback={fallback}>
    {children}
  </ProtectedRoute>
);