import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Navigation } from "@/components/ui/navigation";
import MessageThread from "@/components/ui/message-thread";
import { 
  Home, 
  Briefcase, 
  FileText, 
  MessageCircle, 
  User, 
  DollarSign,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  PlusCircle,
  MoreHorizontal,
  Camera
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: myJobs } = useQuery({
    queryKey: ["/api/my-jobs"],
    enabled: !!user && (user as any)?.userType === 'client',
  });

  const { data: myProposals } = useQuery({
    queryKey: ["/api/my-proposals"],
    enabled: !!user && (user as any)?.userType === 'freelancer',
  });

  const { data: myContracts } = useQuery({
    queryKey: ["/api/my-contracts"],
    enabled: !!user,
  });

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", "/api/auth/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (imageData: string) => {
      await apiRequest("POST", "/api/auth/upload-photo", { imageData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const switchUserTypeMutation = useMutation({
    mutationFn: async (userType: string) => {
      await apiRequest("POST", "/api/auth/switch-type", { userType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "User type switched successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to switch user type",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-upwork-green"></div>
      </div>
    );
  }

  if (!user) return null;

  const isFreelancer = user.userType === 'freelancer';
  const profileCompletion = calculateProfileCompletion(user);

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "jobs", label: isFreelancer ? "My Jobs" : "Posted Jobs", icon: Briefcase },
    { id: "proposals", label: "Proposals", icon: FileText },
    { id: "messages", label: "Messages", icon: MessageCircle, badge: unreadCount?.count },
    { id: "profile", label: "Profile", icon: User },
    { id: "earnings", label: isFreelancer ? "Earnings" : "Spending", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.profileImageUrl || ""} />
                <AvatarFallback>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-500 capitalize">{user.userType}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left ${
                      activeTab === item.id
                        ? "bg-upwork-light text-upwork-green"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge className="bg-red-500 text-white text-xs ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="p-8 h-full overflow-y-auto">
            
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  Welcome back, {user.firstName}!
                </h1>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-upwork-light rounded-lg p-3">
                          <Briefcase className="w-6 h-6 text-upwork-green" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">
                            {isFreelancer ? "Active Proposals" : "Active Jobs"}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {isFreelancer 
                              ? myProposals?.filter((p: any) => p.status === 'submitted').length || 0
                              : myJobs?.filter((j: any) => j.status === 'open').length || 0
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-lg p-3">
                          <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">
                            {isFreelancer ? "Hours This Week" : "Projects This Month"}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {isFreelancer ? "32" : myJobs?.length || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-lg p-3">
                          <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">This Month</p>
                          <p className="text-2xl font-bold text-gray-900">$2,450</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="bg-yellow-100 rounded-lg p-3">
                          <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-2xl font-bold text-gray-900">4.9</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity and Active Projects */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {myContracts?.slice(0, 3).map((contract: any) => (
                          <div key={contract.id} className="flex items-center space-x-3">
                            <div className="bg-green-100 rounded-full p-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Working on "{contract.job.title}"
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(contract.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {(!myContracts || myContracts.length === 0) && (
                          <p className="text-gray-500 text-sm">No recent activity</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Active Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {myContracts?.slice(0, 2).map((contract: any) => (
                          <div key={contract.id} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium">{contract.job.title}</h4>
                            <p className="text-sm text-gray-600">
                              {isFreelancer ? `Client: ${contract.client.firstName} ${contract.client.lastName}` : `Freelancer: ${contract.freelancer.firstName} ${contract.freelancer.lastName}`}
                            </p>
                            <div className="mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>75%</span>
                              </div>
                              <Progress value={75} className="h-2" />
                            </div>
                          </div>
                        ))}
                        {(!myContracts || myContracts.length === 0) && (
                          <p className="text-gray-500 text-sm">No active projects</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === "jobs" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isFreelancer ? "My Jobs" : "Posted Jobs"}
                  </h1>
                  {!isFreelancer && (
                    <Link href="/post-job">
                      <Button className="bg-upwork-green hover:bg-upwork-dark text-white">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Post New Job
                      </Button>
                    </Link>
                  )}
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8 px-6">
                        <button className="border-b-2 border-upwork-green text-upwork-green py-4 px-1 text-sm font-medium">
                          {isFreelancer ? "Active (3)" : "Open Jobs"}
                        </button>
                        <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
                          {isFreelancer ? "Completed (12)" : "In Progress"}
                        </button>
                        <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
                          Completed
                        </button>
                      </nav>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {isFreelancer ? (
                        myContracts?.map((contract: any) => (
                          <div key={contract.id} className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {contract.job.title}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                  {contract.client.firstName} {contract.client.lastName} • Started {new Date(contract.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                  {contract.job.description.substring(0, 150)}...
                                </p>
                                <div className="flex items-center space-x-4 mt-4">
                                  <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                                    {contract.status}
                                  </Badge>
                                  <span className="text-sm text-gray-500">75% Complete</span>
                                  <span className="text-sm text-gray-500">
                                    ${contract.totalEarnings} earned
                                  </span>
                                </div>
                              </div>
                              <div className="ml-6 flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        myJobs?.map((job: any) => (
                          <div key={job.id} className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                <p className="text-gray-600 mt-1">
                                  Posted {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                  {job.description.substring(0, 150)}...
                                </p>
                                <div className="flex items-center space-x-4 mt-4">
                                  <Badge variant={job.status === 'open' ? 'secondary' : 'default'}>
                                    {job.status.replace('_', ' ')}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {job.proposalCount} proposals
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {job.budgetType === 'fixed' 
                                      ? `$${job.budgetMin} - $${job.budgetMax}`
                                      : `$${job.hourlyRate}/hr`
                                    }
                                  </span>
                                </div>
                              </div>
                              <div className="ml-6 flex space-x-2">
                                <Button variant="ghost" size="sm">
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {((isFreelancer && (!myContracts || myContracts.length === 0)) || 
                        (!isFreelancer && (!myJobs || myJobs.length === 0))) && (
                        <div className="p-12 text-center">
                          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {isFreelancer ? "No active jobs" : "No jobs posted"}
                          </h3>
                          <p className="text-gray-600">
                            {isFreelancer 
                              ? "Start browsing and applying to jobs to see them here."
                              : "Post your first job to start finding freelancers."
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Proposals Tab */}
            {activeTab === "proposals" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
                  {isFreelancer && (
                    <Button className="bg-upwork-green hover:bg-upwork-dark text-white">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Button>
                  )}
                </div>
                
                <Card>
                  <CardContent className="p-0">
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8 px-6">
                        <button className="border-b-2 border-upwork-green text-upwork-green py-4 px-1 text-sm font-medium">
                          Submitted ({myProposals?.length || 0})
                        </button>
                        <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
                          Interviewing
                        </button>
                        <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
                          Archived
                        </button>
                      </nav>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {myProposals?.map((proposal: any) => (
                        <div key={proposal.id} className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {proposal.job.title}
                              </h3>
                              <p className="text-gray-600 mt-1">
                                Submitted {new Date(proposal.createdAt).toLocaleDateString()} • 
                                ${proposal.proposedRate}
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                {proposal.coverLetter.substring(0, 150)}...
                              </p>
                              <div className="flex items-center space-x-4 mt-4">
                                <Badge variant={
                                  proposal.status === 'accepted' ? 'default' :
                                  proposal.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                }>
                                  {proposal.status}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {proposal.job.proposalCount} proposals
                                </span>
                              </div>
                            </div>
                            <div className="ml-6">
                              <Button variant="outline" size="sm">
                                View Proposal
                              </Button>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="p-12 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                          <p className="text-gray-600">
                            Start browsing jobs and submit your first proposal.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === "messages" && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
                <MessageThread conversations={conversations} />
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <ProfileTab 
                user={user} 
                profileCompletion={profileCompletion}
                onUpdateProfile={(data) => updateProfileMutation.mutate(data)}
                onUploadPhoto={(imageData) => uploadPhotoMutation.mutate(imageData)}
                onSwitchUserType={(userType) => switchUserTypeMutation.mutate(userType)}
                isUpdating={updateProfileMutation.isPending}
                isUploadingPhoto={uploadPhotoMutation.isPending}
                isSwitchingType={switchUserTypeMutation.isPending}
              />
            )}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                  {isFreelancer ? "Earnings" : "Spending"}
                </h1>
                
                {/* Earnings Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Total Earnings</h3>
                      <p className="text-3xl font-bold text-gray-900">$28,450</p>
                      <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">This Month</h3>
                      <p className="text-3xl font-bold text-gray-900">$2,450</p>
                      <p className="text-sm text-upwork-green mt-1">3 projects completed</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
                      <p className="text-3xl font-bold text-gray-900">$1,850</p>
                      <p className="text-sm text-yellow-600 mt-1">2 invoices pending</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Available</h3>
                      <p className="text-3xl font-bold text-gray-900">$600</p>
                      <p className="text-sm text-gray-500 mt-1">Ready to withdraw</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Transaction History */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Transactions</CardTitle>
                      <Button variant="outline">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myContracts?.map((contract: any) => (
                        <div key={contract.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{contract.job.title}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(contract.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">
                              +${contract.totalEarnings}
                            </p>
                            <Badge variant="outline">Completed</Badge>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                          <p className="text-gray-600">
                            Your earnings will appear here once you complete projects.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user, profileCompletion, onUpdateProfile, onUploadPhoto, onSwitchUserType, isUpdating, isUploadingPhoto, isSwitchingType }: any) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    title: user.title || "",
    bio: user.bio || "",
    hourlyRate: user.hourlyRate || "",
    location: user.location || "",
    company: user.company || "",
    skills: user.skills?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...formData,
      skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("File size must be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        onUploadPhoto(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                {user.userType === 'client' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <Textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself, your experience, and what makes you unique..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills (comma-separated)
                  </label>
                  <Input
                    value={formData.skills}
                    onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                    placeholder="React, Node.js, JavaScript, MongoDB, Project Management"
                  />
                </div>
                {user.userType === 'freelancer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Professional Title
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Full Stack Developer, UI/UX Designer"
                    />
                  </div>
                )}
                {user.userType === 'freelancer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate ($)
                    </label>
                    <Input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      placeholder="25"
                    />
                  </div>
                )}
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-upwork-green hover:bg-upwork-dark"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>


        </div>

        {/* Profile Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback className="text-2xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <Button 
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={isUploadingPhoto}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Type Switcher for Testing */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Switch user type for testing:</p>
                <div className="flex space-x-2">
                  <Button
                    variant={user.userType === 'client' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSwitchUserType('client')}
                    disabled={isSwitchingType}
                  >
                    Client
                  </Button>
                  <Button
                    variant={user.userType === 'freelancer' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSwitchUserType('freelancer')}
                    disabled={isSwitchingType}
                  >
                    Freelancer
                  </Button>
                  <Button
                    variant={user.userType === 'admin' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSwitchUserType('admin')}
                    disabled={isSwitchingType}
                  >
                    Admin
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Current: {user.userType}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <ProgressRing value={profileCompletion} size={140} strokeWidth={10}>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {profileCompletion}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Complete
                    </div>
                  </div>
                </ProgressRing>
                
                <div className="w-full space-y-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">Complete your profile:</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {user.firstName && user.lastName ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                        )}
                        <span className="text-sm">Basic info</span>
                      </div>
                      {user.firstName && user.lastName && (
                        <span className="text-xs text-green-600 font-medium">✓</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {user.profileImageUrl ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                        )}
                        <span className="text-sm">Profile photo</span>
                      </div>
                      {user.profileImageUrl && (
                        <span className="text-xs text-green-600 font-medium">✓</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {user.skills && user.skills.length > 0 ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                        )}
                        <span className="text-sm">Skills</span>
                      </div>
                      {user.skills && user.skills.length > 0 && (
                        <span className="text-xs text-green-600 font-medium">✓</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {user.bio ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                        )}
                        <span className="text-sm">Bio</span>
                      </div>
                      {user.bio && (
                        <span className="text-xs text-green-600 font-medium">✓</span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {(user.userType === 'freelancer' ? user.title : user.company) ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                        )}
                        <span className="text-sm">
                          {user.userType === 'freelancer' ? 'Professional title' : 'Company'}
                        </span>
                      </div>
                      {(user.userType === 'freelancer' ? user.title : user.company) && (
                        <span className="text-xs text-green-600 font-medium">✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function calculateProfileCompletion(user: any): number {
  let completed = 0;
  const total = 6;

  const checks = {
    basicInfo: user.firstName && user.lastName,
    email: user.email,
    profileImage: user.profileImageUrl,
    bio: user.bio,
    skills: user.skills && user.skills.length > 0,
    professionalInfo: user.userType === 'freelancer' ? user.title : user.company
  };

  if (checks.basicInfo) completed++;
  if (checks.email) completed++;
  if (checks.profileImage) completed++;
  if (checks.bio) completed++;
  if (checks.skills) completed++;
  if (checks.professionalInfo) completed++;

  console.log("Profile completion calculation:", {
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio,
      skills: user.skills,
      userType: user.userType,
      company: user.company,
      title: user.title
    },
    checks,
    completed,
    total,
    percentage: Math.round((completed / total) * 100)
  });

  return Math.round((completed / total) * 100);
}
