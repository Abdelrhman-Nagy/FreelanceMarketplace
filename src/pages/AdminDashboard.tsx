import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Users, Briefcase, FileText, TrendingUp } from 'lucide-react';
import { UserManagementModal } from '../components/admin/UserManagementModal';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showUserManagement, setShowUserManagement] = useState(false);

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

  // User Management handlers
  const handleViewAllUsers = () => {
    setShowUserManagement(true);
  };

  const handleManagePermissions = () => {
    console.log('Manage Permissions clicked');
    alert('User Management feature: Manage Permissions');
  };

  const handleUserAnalytics = () => {
    console.log('User Analytics clicked');
    alert('User Management feature: User Analytics');
  };

  // Platform Management handlers
  const handleJobModeration = () => {
    console.log('Job Moderation clicked');
    alert('Platform Management feature: Job Moderation');
  };

  const handlePaymentOversight = () => {
    console.log('Payment Oversight clicked');
    alert('Platform Management feature: Payment Oversight');
  };

  const handleSystemReports = () => {
    console.log('System Reports clicked');
    alert('Platform Management feature: System Reports');
  };

  const stats = [
    { title: 'Total Users', value: '1,234', icon: Users, trend: '+12%' },
    { title: 'Active Jobs', value: '456', icon: Briefcase, trend: '+8%' },
    { title: 'Proposals', value: '789', icon: FileText, trend: '+15%' },
    { title: 'Revenue', value: '$12,345', icon: TrendingUp, trend: '+23%' }
  ];

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

          {/* Admin Functions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full" variant="outline" onClick={handleViewAllUsers}>
                    View All Users
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleManagePermissions}>
                    Manage Permissions
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleUserAnalytics}>
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
                  <Button className="w-full" variant="outline" onClick={handleJobModeration}>
                    Job Moderation
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handlePaymentOversight}>
                    Payment Oversight
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleSystemReports}>
                    System Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

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

      <UserManagementModal 
        isOpen={showUserManagement} 
        onClose={() => setShowUserManagement(false)} 
      />
    </div>
  );
};

export default AdminDashboard;