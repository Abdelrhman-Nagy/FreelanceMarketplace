import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Users, Briefcase, FileText, DollarSign, Ban, Shield, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect as useProtectedPageEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface AdminStats {
  id: number;
  totalUsers: number;
  totalJobs: number;
  totalProposals: number;
  totalContracts: number;
  totalRevenue: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  status: string;
  budgetType: string;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRate?: number;
  createdAt: string;
  client: User;
}

interface Proposal {
  id: number;
  coverLetter: string;
  proposedRate: number;
  status: string;
  createdAt: string;
  job: Job;
  freelancer: User;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [userFilters, setUserFilters] = useState({ userType: "all", search: "", page: 1 });
  const [jobFilters, setJobFilters] = useState({ status: "all", search: "", page: 1 });
  const [proposalFilters, setProposalFilters] = useState({ status: "all", page: 1 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState("");

  // Redirect if not admin
  useProtectedPageEffect(() => {
    if (!isLoading && (!isAuthenticated || (user as any)?.userType !== 'admin')) {
      toast({
        title: "Unauthorized",
        description: "Admin access required. Redirecting...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  // Admin stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && (user as any)?.userType === 'admin',
  });

  // Users query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users", userFilters],
    enabled: isAuthenticated && (user as any)?.userType === 'admin',
  });

  // Jobs query
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/admin/jobs", jobFilters],
    enabled: isAuthenticated && (user as any)?.userType === 'admin',
  });

  // Proposals query
  const { data: proposalsData, isLoading: proposalsLoading } = useQuery({
    queryKey: ["/api/admin/proposals", proposalFilters],
    enabled: isAuthenticated && (user as any)?.userType === 'admin',
  });

  // Update stats mutation
  const updateStatsMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/stats/update", "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Statistics updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Admin access required. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update statistics",
        variant: "destructive",
      });
    },
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiRequest(`/api/admin/users/${userId}/suspend`, "POST", { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSuspendDialogOpen(false);
      setSuspensionReason("");
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User suspended successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Admin access required. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to suspend user",
        variant: "destructive",
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, userType }: { userId: string; userType: string }) =>
      apiRequest(`/api/admin/users/${userId}/role`, "PUT", { userType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setRoleChangeDialogOpen(false);
      setNewRole("");
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Admin access required. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest(`/api/admin/users/${userId}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Admin access required. Redirecting...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/api/login", 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated || (user as any)?.userType !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Verifying admin access</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSuspendUser = (user: User) => {
    setSelectedUser(user);
    setSuspendDialogOpen(true);
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.userType);
    setRoleChangeDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, jobs, and platform statistics</p>
        </div>
        <Button
          onClick={() => updateStatsMutation.mutate()}
          disabled={updateStatsMutation.isPending}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${updateStatsMutation.isPending ? 'animate-spin' : ''}`} />
          Update Stats
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : (stats as any)?.totalUsers || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.totalJobs || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.totalProposals || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : formatCurrency(stats?.totalRevenue || "0")}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search users..."
              value={userFilters.search}
              onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="max-w-sm"
            />
            <Select
              value={userFilters.userType}
              onValueChange={(value) => setUserFilters(prev => ({ ...prev, userType: value, page: 1 }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="freelancer">Freelancers</SelectItem>
                <SelectItem value="client">Clients</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage platform users and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">Loading users...</div>
              ) : (
                <div className="space-y-4">
                  {usersData?.users?.map((user: User) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.firstName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{user.userType}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Joined {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChangeRole(user)}
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspendUser(user)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search jobs..."
              value={jobFilters.search}
              onChange={(e) => setJobFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="max-w-sm"
            />
            <Select
              value={jobFilters.status}
              onValueChange={(value) => setJobFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Management</CardTitle>
              <CardDescription>Monitor and manage job postings</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="text-center py-8">Loading jobs...</div>
              ) : (
                <div className="space-y-4">
                  {jobsData?.jobs?.map((job: Job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium">{job.title}</h3>
                        <Badge variant="outline">{job.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span>Client: {job.client.firstName} {job.client.lastName}</span>
                          <span>
                            Budget: {job.budgetType === 'fixed' 
                              ? formatCurrency(job.budgetMin?.toString() || "0")
                              : `${formatCurrency(job.hourlyRate?.toString() || "0")}/hr`
                            }
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          Posted {formatDate(job.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="proposals" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Select
              value={proposalFilters.status}
              onValueChange={(value) => setProposalFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Proposals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Proposal Management</CardTitle>
              <CardDescription>Monitor proposal submissions and status</CardDescription>
            </CardHeader>
            <CardContent>
              {proposalsLoading ? (
                <div className="text-center py-8">Loading proposals...</div>
              ) : (
                <div className="space-y-4">
                  {proposalsData?.proposals?.map((proposal: Proposal) => (
                    <div key={proposal.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{proposal.job.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {proposal.freelancer.firstName} {proposal.freelancer.lastName}
                          </p>
                        </div>
                        <Badge variant="outline">{proposal.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {proposal.coverLetter}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span>Proposed Rate: {formatCurrency(proposal.proposedRate.toString())}</span>
                        <span className="text-muted-foreground">
                          Submitted {formatDate(proposal.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Provide a reason for suspending {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter suspension reason..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && suspendUserMutation.mutate({
                userId: selectedUser.id,
                reason: suspensionReason
              })}
              disabled={!suspensionReason.trim() || suspendUserMutation.isPending}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedUser && updateRoleMutation.mutate({
                userId: selectedUser.id,
                userType: newRole
              })}
              disabled={!newRole || newRole === selectedUser?.userType || updateRoleMutation.isPending}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}