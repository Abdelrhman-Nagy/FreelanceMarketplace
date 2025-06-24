import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Briefcase, Users, DollarSign, FileText } from 'lucide-react';

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

  // Fetch client statistics
  const { data: statsData } = useQuery({
    queryKey: ['/api/auth/statistics'],
    enabled: !!user,
  });

  // Fetch client jobs
  const { data: jobsData } = useQuery({
    queryKey: ['/api/jobs/my-jobs'],
    enabled: !!user,
  });

  // Fetch client projects
  const { data: projectsData } = useQuery({
    queryKey: ['/api/projects'],
    enabled: !!user,
  });

  const stats = [
    { title: 'Posted Jobs', value: jobsData?.total || '0', icon: Briefcase },
    { title: 'Active Projects', value: projectsData?.total || '0', icon: Users },
    { title: 'Total Proposals', value: statsData?.totalProposals || '0', icon: FileText },
    { title: 'Total Spent', value: '$' + (statsData?.totalSpent || '0'), icon: DollarSign }
  ];

  const recentJobs = jobsData?.jobs?.slice(0, 3) || [];
  const activeProjects = projectsData?.projects?.slice(0, 3) || [];

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <Button className="w-full" variant="outline" onClick={() => setLocation('/freelancers')}>
                    <Users className="mr-2 h-4 w-4" />
                    Find Freelancers
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setLocation('/projects')}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Manage Projects
                  </Button>
                  <Button className="w-full" variant="outline" onClick={() => setLocation('/messages')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Messages
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
                  {recentJobs.length > 0 ? (
                    recentJobs.map((job) => (
                      <div key={job.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{job.title}</p>
                          <p className="text-sm text-gray-500">{job.proposalCount} proposals received</p>
                        </div>
                        <Badge variant="secondary">{job.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No jobs posted yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setLocation('/post-job')}
                      >
                        Post Your First Job
                      </Button>
                    </div>
                  )}
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
                  {activeProjects.length > 0 ? (
                    activeProjects.map((project) => (
                      <div key={project.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-sm text-gray-500">With {project.freelancerName || 'Unassigned'}</p>
                        </div>
                        <Badge variant="secondary" className={
                          project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No active projects</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setLocation('/projects')}
                      >
                        View All Projects
                      </Button>
                    </div>
                  )}
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