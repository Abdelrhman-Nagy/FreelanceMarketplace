import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Users, Briefcase, FileText, DollarSign, TrendingUp, Eye, Ban, Trash2, AlertTriangle, Shield, BarChart3, Settings, Search } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [proposalSearchTerm, setProposalSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated || !hasRole(['admin'])) {
      setLocation('/login');
    }
  }, [isAuthenticated, hasRole, setLocation]);

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  // Fetch admin statistics
  const { data: adminStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!user,
  });

  // Fetch all users for management
  const { data: usersData } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!user,
  });

  // Fetch all jobs for moderation
  const { data: jobsData } = useQuery({
    queryKey: ['/api/admin/jobs'],
    enabled: !!user,
  });

  // Fetch all proposals for moderation
  const { data: proposalsData } = useQuery({
    queryKey: ['/api/admin/proposals'],
    enabled: !!user,
  });

  // User management mutations
  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: 'User approved successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to approve user', variant: 'destructive' });
    },
  });

  const rejectUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return apiRequest(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: 'User rejected successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to reject user', variant: 'destructive' });
    },
  });

  const suspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'User suspended successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to suspend user', variant: 'destructive' });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'User deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete user', variant: 'destructive' });
    },
  });

  // Job moderation mutations
  const approveJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest(`/api/admin/jobs/${jobId}/approve`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: 'Job approved successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to approve job', variant: 'destructive' });
    },
  });

  const rejectJobMutation = useMutation({
    mutationFn: async ({ jobId, reason }: { jobId: number; reason: string }) => {
      return apiRequest(`/api/admin/jobs/${jobId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/jobs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: 'Job rejected successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to reject job', variant: 'destructive' });
    },
  });

  const suspendJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest(`/api/admin/jobs/${jobId}/suspend`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/jobs'] });
      toast({ title: 'Job suspended successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to suspend job', variant: 'destructive' });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return apiRequest(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/jobs'] });
      toast({ title: 'Job deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete job', variant: 'destructive' });
    },
  });

  // Proposal moderation mutations
  const suspendProposalMutation = useMutation({
    mutationFn: async (proposalId: number) => {
      return apiRequest(`/api/admin/proposals/${proposalId}/suspend`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] });
      toast({ title: 'Proposal suspended successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to suspend proposal', variant: 'destructive' });
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: async (proposalId: number) => {
      return apiRequest(`/api/admin/proposals/${proposalId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/proposals'] });
      toast({ title: 'Proposal deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete proposal', variant: 'destructive' });
    },
  });

  const stats = [
    { title: 'Total Users', value: adminStats?.totalUsers || '0', icon: Users, change: '+12%' },
    { title: 'Active Jobs', value: adminStats?.activeJobs || '0', icon: Briefcase, change: '+8%' },
    { title: 'Proposals', value: adminStats?.totalProposals || '0', icon: FileText, change: '+15%' },
    { title: 'Revenue', value: '$' + (adminStats?.totalRevenue || '0'), icon: DollarSign, change: '+23%' }
  ];

  const users = usersData?.users || [];
  const jobs = jobsData?.jobs || [];
  const proposals = proposalsData?.proposals || [];

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
    job.category.toLowerCase().includes(jobSearchTerm.toLowerCase())
  );

  const filteredProposals = proposals.filter(proposal =>
    proposal.freelancerName.toLowerCase().includes(proposalSearchTerm.toLowerCase()) ||
    proposal.jobTitle.toLowerCase().includes(proposalSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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
                        <p className="text-sm text-green-600">{stat.trend}</p>
                      </div>
                      <Icon className="h-8 w-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        View All Users
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>User Management</DialogTitle>
                        <DialogDescription>
                          Manage all platform users and their permissions
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4" />
                          <Input
                            placeholder="Search users..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approval</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {user.role}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                                      {user.status || 'active'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      user.approvalStatus === 'approved' ? 'default' :
                                      user.approvalStatus === 'pending' ? 'secondary' :
                                      'destructive'
                                    }>
                                      {user.approvalStatus || 'approved'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-1">
                                      {user.approvalStatus === 'pending' && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => approveUserMutation.mutate(user.id)}
                                            disabled={approveUserMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            ✓
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                              const reason = prompt('Rejection reason:');
                                              if (reason) rejectUserMutation.mutate({ userId: user.id, reason });
                                            }}
                                            disabled={rejectUserMutation.isPending}
                                          >
                                            ✗
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => suspendUserMutation.mutate(user.id)}
                                        disabled={suspendUserMutation.isPending}
                                      >
                                        <Ban className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteUserMutation.mutate(user.id)}
                                        disabled={deleteUserMutation.isPending}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button className="w-full" variant="outline">
                    <Shield className="mr-2 h-4 w-4" />
                    Manage Permissions
                  </Button>
                  <Button className="w-full" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    User Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Management</CardTitle>
                <CardDescription>Monitor and control platform operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Job Moderation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl">
                      <DialogHeader>
                        <DialogTitle>Job Moderation</DialogTitle>
                        <DialogDescription>
                          Review and approve job postings
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4" />
                          <Input
                            placeholder="Search jobs..."
                            value={jobSearchTerm}
                            onChange={(e) => setJobSearchTerm(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approval</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredJobs.map((job) => (
                                <TableRow key={job.id}>
                                  <TableCell className="font-medium">{job.title}</TableCell>
                                  <TableCell>{job.clientName}</TableCell>
                                  <TableCell>{job.budget}</TableCell>
                                  <TableCell>
                                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                                      {job.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      job.approvalStatus === 'approved' ? 'default' :
                                      job.approvalStatus === 'pending' ? 'secondary' :
                                      'destructive'
                                    }>
                                      {job.approvalStatus}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(job.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-1">
                                      {job.approvalStatus === 'pending' && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => approveJobMutation.mutate(job.id)}
                                            disabled={approveJobMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            ✓
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                              const reason = prompt('Rejection reason:');
                                              if (reason) rejectJobMutation.mutate({ jobId: job.id, reason });
                                            }}
                                            disabled={rejectJobMutation.isPending}
                                          >
                                            ✗
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => suspendJobMutation.mutate(job.id)}
                                        disabled={suspendJobMutation.isPending}
                                      >
                                        <Ban className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteJobMutation.mutate(job.id)}
                                        disabled={deleteJobMutation.isPending}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Proposal Moderation
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                      <DialogHeader>
                        <DialogTitle>Proposal Moderation</DialogTitle>
                        <DialogDescription>
                          Review and moderate all proposals
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4" />
                          <Input
                            placeholder="Search proposals..."
                            value={proposalSearchTerm}
                            onChange={(e) => setProposalSearchTerm(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Freelancer</TableHead>
                                <TableHead>Rate</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredProposals.map((proposal) => (
                                <TableRow key={proposal.id}>
                                  <TableCell className="font-medium">{proposal.jobTitle}</TableCell>
                                  <TableCell>{proposal.freelancerName}</TableCell>
                                  <TableCell>${proposal.proposedRate}</TableCell>
                                  <TableCell>
                                    <Badge variant={
                                      proposal.status === 'accepted' ? 'default' :
                                      proposal.status === 'pending' ? 'secondary' :
                                      'destructive'
                                    }>
                                      {proposal.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(proposal.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => suspendProposalMutation.mutate(proposal.id)}
                                        disabled={suspendProposalMutation.isPending}
                                      >
                                        <Ban className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteProposalMutation.mutate(proposal.id)}
                                        disabled={deleteProposalMutation.isPending}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button className="w-full" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    System Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and System Health Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New user registration</span>
                    <span className="text-xs text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Job posted</span>
                    <span className="text-xs text-gray-500">5 min ago</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Proposal submitted</span>
                    <span className="text-xs text-gray-500">10 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Server Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Response</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Fast</Badge>
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

export default AdminDashboard;