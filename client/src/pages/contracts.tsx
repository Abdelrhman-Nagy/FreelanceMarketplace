import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/ui/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { formatDistance } from "date-fns";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Contract {
  id: number;
  jobId: number;
  freelancerId: string;
  clientId: string;
  proposalId: number;
  status: string;
  totalEarnings: string;
  hoursWorked: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: number;
    title: string;
    description: string;
    budgetType: string;
    budgetMin?: number;
    budgetMax?: number;
    hourlyRate?: number;
  };
  client?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  freelancer?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

export default function Contracts() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("active");

  const { data: contracts, isLoading } = useQuery({
    queryKey: [user?.userType === 'client' ? '/api/my-contracts' : '/api/my-contracts'],
    enabled: !!isAuthenticated,
  });

  const updateContractMutation = useMutation({
    mutationFn: async ({ contractId, status }: { contractId: number; status: string }) => {
      return await apiRequest(`/api/contracts/${contractId}`, {
        method: 'PATCH',
        body: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/my-contracts'] });
      toast({
        title: "Success",
        description: "Contract status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update contract status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getPersonName = (person: any) => {
    if (person?.firstName && person?.lastName) {
      return `${person.firstName} ${person.lastName}`;
    }
    return person?.email || 'Unknown';
  };

  const handleStatusUpdate = (contractId: number, newStatus: string) => {
    updateContractMutation.mutate({ contractId, status: newStatus });
  };

  const filteredContracts = contracts?.filter((contract: Contract) => {
    if (activeTab === "active") return contract.status === "active";
    if (activeTab === "completed") return contract.status === "completed";
    if (activeTab === "pending") return contract.status === "pending";
    return true;
  }) || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-6">
              <p>Please log in to view your contracts.</p>
              <Link href="/api/login">
                <Button className="mt-4">Log In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Contracts</h1>
          <p className="text-muted-foreground">
            {user?.userType === 'client' ? 
              'Manage your active projects and freelancer contracts' : 
              'View your active and completed work contracts'
            }
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredContracts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No {activeTab} contracts
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {user?.userType === 'client' ? 
                      'You haven\'t hired any freelancers yet.' : 
                      'You don\'t have any contracts in this category.'
                    }
                  </p>
                  <Link href="/browse-jobs">
                    <Button>
                      {user?.userType === 'client' ? 'Post a Job' : 'Browse Jobs'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredContracts.map((contract: Contract) => (
                  <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 line-clamp-2">
                            {contract.job.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(contract.status)}
                            {getStatusBadge(contract.status)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Contract Partner Info */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={user?.userType === 'client' ? 
                              contract.freelancer?.profileImageUrl : 
                              contract.client?.profileImageUrl
                            } 
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user?.userType === 'client' ? 
                              getPersonName(contract.freelancer) : 
                              getPersonName(contract.client)
                            }
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user?.userType === 'client' ? 'Freelancer' : 'Client'}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {/* Contract Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">${contract.totalEarnings}</p>
                            <p className="text-xs text-muted-foreground">Total Earned</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">{contract.hoursWorked}h</p>
                            <p className="text-xs text-muted-foreground">Hours Worked</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <p className="text-sm text-muted-foreground">
                          Started {formatDistance(new Date(contract.createdAt), new Date(), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Budget Info */}
                      {contract.job.budgetType === 'fixed' && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Fixed Price Project</p>
                          <p className="text-sm text-muted-foreground">
                            ${contract.job.budgetMin} - ${contract.job.budgetMax}
                          </p>
                          {contract.status === 'active' && (
                            <Progress 
                              value={(parseFloat(contract.totalEarnings) / (contract.job.budgetMax || 1)) * 100} 
                              className="mt-2" 
                            />
                          )}
                        </div>
                      )}

                      {contract.job.budgetType === 'hourly' && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Hourly Project</p>
                          <p className="text-sm text-muted-foreground">
                            ${contract.job.hourlyRate}/hour
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link 
                          href={user?.userType === 'client' ? 
                            `/messages?conversation=${contract.freelancer?.id}` : 
                            `/messages?conversation=${contract.client?.id}`
                          }
                        >
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </Link>
                        
                        {contract.status === 'active' && user?.userType === 'client' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusUpdate(contract.id, 'completed')}
                            disabled={updateContractMutation.isPending}
                          >
                            Mark Complete
                          </Button>
                        )}
                        
                        {contract.status === 'pending' && (
                          <div className="flex gap-1">
                            {user?.userType === 'client' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusUpdate(contract.id, 'active')}
                                disabled={updateContractMutation.isPending}
                              >
                                Approve
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}