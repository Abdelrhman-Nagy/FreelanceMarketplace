import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Bookmark, DollarSign, Star } from 'lucide-react';

const FreelancerDashboard: React.FC = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !hasRole(['freelancer'])) {
      setLocation('/login');
    }
  }, [isAuthenticated, hasRole, setLocation]);

  if (!user || user.role !== 'freelancer') {
    return <div>Access denied</div>;
  }

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  const stats = [
    { title: 'Proposals Sent', value: '23', icon: FileText },
    { title: 'Active Projects', value: '3', icon: Star },
    { title: 'Saved Jobs', value: '8', icon: Bookmark },
    { title: 'Total Earnings', value: '$5,240', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Freelancer Dashboard</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <CardDescription>Find opportunities and manage your work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" onClick={() => setLocation('/jobs')}>
                    <Search className="mr-2 h-4 w-4" />
                    Browse Jobs
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setLocation('/proposals')}>
                    View My Proposals
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setLocation('/saved-jobs')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
                <CardDescription>Your freelancer profile summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Skills</span>
                    <span className="text-sm font-medium">
                      {user.skills?.length || 0} skills listed
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Experience</span>
                    <span className="text-sm font-medium capitalize">
                      {user.experience || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hourly Rate</span>
                    <span className="text-sm font-medium">
                      ${user.hourlyRate || 'Not set'}/hr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rating</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{user.rating || 'New'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Proposals</CardTitle>
                <CardDescription>Your latest job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">React Developer Position</p>
                      <p className="text-sm text-gray-500">Submitted 2 days ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">UI/UX Design Project</p>
                      <p className="text-sm text-gray-500">Submitted 5 days ago</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Accepted</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>Jobs matching your skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Full Stack Developer</p>
                      <p className="text-sm text-gray-500">$2000 - $3000</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Node.js Backend</p>
                      <p className="text-sm text-gray-500">$1500 - $2500</p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
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

export default FreelancerDashboard;