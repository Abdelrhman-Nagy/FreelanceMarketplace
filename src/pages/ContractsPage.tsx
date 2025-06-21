import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { FileText, Calendar, DollarSign, User, Briefcase, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Contract {
  id: number;
  proposalId: number;
  clientId: string;
  freelancerId: string;
  jobId: number;
  jobTitle: string;
  jobDescription: string;
  clientName: string;
  clientCompany: string;
  freelancerName: string;
  proposedRate: number;
  estimatedDuration: string;
  status: string;
  startDate: string;
  endDate?: string;
  terms?: string;
  coverLetter: string;
  proposalStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface ContractsResponse {
  contracts: Contract[];
  success: boolean;
}

export default function ContractsPage() {
  const { user } = useAuth();

  const { data: contractsData, isLoading, error } = useQuery<ContractsResponse>({
    queryKey: ['/api/contracts'],
    staleTime: 5 * 60 * 1000,
  });

  const contracts = contractsData?.contracts || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'disputed':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Disputed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Contracts</h1>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Contracts</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error loading contracts: {error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Contracts</h1>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {contracts.length} {contracts.length === 1 ? 'Contract' : 'Contracts'}
        </Badge>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Contracts Yet</h3>
            <p className="text-gray-600 mb-6">
              {user?.userType === 'freelancer' 
                ? "Once clients accept your proposals, your contracts will appear here."
                : "When you accept freelancer proposals, your contracts will appear here."
              }
            </p>
            <Button variant="outline">
              {user?.userType === 'freelancer' ? 'Browse Jobs' : 'Post a Job'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-xl">
                      {contract.jobTitle}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {user?.userType === 'freelancer' 
                          ? `Client: ${contract.clientName}${contract.clientCompany ? ` (${contract.clientCompany})` : ''}`
                          : `Freelancer: ${contract.freelancerName}`
                        }
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Started: {formatDate(contract.startDate)}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(contract.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-600 line-clamp-2">
                  {contract.jobDescription}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Rate</p>
                      <p className="font-semibold text-green-600">
                        {contract.proposedRate ? `$${contract.proposedRate}/hr` : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-semibold">
                        {contract.estimatedDuration || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Contract ID</p>
                      <p className="font-semibold">#{contract.id}</p>
                    </div>
                  </div>
                </div>

                {contract.coverLetter && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Original Proposal</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {contract.coverLetter}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Contract created: {formatDate(contract.createdAt)}
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {contract.status === 'active' && (
                      <Button size="sm">
                        Message {user?.userType === 'freelancer' ? 'Client' : 'Freelancer'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}