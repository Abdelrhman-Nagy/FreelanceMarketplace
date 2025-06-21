import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const PostJobPage: React.FC = () => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated || !hasRole(['client', 'admin'])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You need to be logged in as a client to post jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a New Job</CardTitle>
          <CardDescription>
            Create a job posting to find the perfect freelancer for your project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Job posting form coming soon!</p>
            <Button onClick={() => setLocation('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJobPage;