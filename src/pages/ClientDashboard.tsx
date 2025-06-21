import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Briefcase, Users, DollarSign } from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !hasRole(['client'])) {
      setLocation('/login');
    }
  }, [isAuthenticated, hasRole, setLocation]);

  if (!user || user.role !== 'client') {
    return <div>Access denied</div>;
  }

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const stats = [
    { title: 'Posted Jobs', value: '12', icon: Briefcase },
    { title: 'Active Projects', value: '5', icon: Users },
    { title: 'Total Spent', value: '$8,450', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.firstName}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">{user.role}</Badge>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" onClick={() => setLocation('/post-job')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Post New Job
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setLocation('/jobs')}>
                    Browse Talent
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setLocation('/projects')}>
                    Manage Projects
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
                <CardDescription>Your client profile summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Company</span>
                    <span className="text-sm font-medium">{user.company || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Member Since</span>
                    <span className="text-sm font-medium">
                      {user.createdAt ? new Date(user.createdAt).getFullYear() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Location</span>
                    <span className="text-sm font-medium">{user.location || 'Not specified'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Your latest job postings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">React Developer Needed</p>
                      <p className="text-sm text-gray-500">5 proposals received</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">UI/UX Designer</p>
                      <p className="text-sm text-gray-500">2 proposals received</p>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Projects currently in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">E-commerce Platform</p>
                      <p className="text-sm text-gray-500">With John Doe</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Mobile App Design</p>
                      <p className="text-sm text-gray-500">With Jane Smith</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Review</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;