import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  DollarSign, 
  Calendar,
  User,
  Mail,
  Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';

interface Proposal {
  id: number;
  jobId: number;
  freelancerId: string;
  freelancerName: string;
  freelancerEmail: string;
  freelancerTitle: string;
  freelancerSkills: string[];
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: string;
  status: string;
  createdAt: string;
}

interface ProposalsResponse {
  proposals: Proposal[];
  total: number;
  status: string;
}

function ClientProposalsPageContent() {
  const { jobId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: proposalsData, isLoading } = useQuery<ProposalsResponse>({
    queryKey: [`/api/jobs/${jobId}/proposals`],
    enabled: !!jobId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ proposalId, status }: { proposalId: number; status: string }) =>
      apiRequest(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}/proposals`] });
      toast({
        title: "Proposal updated",
        description: "The proposal status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating proposal",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const proposals = proposalsData?.proposals || [];

  const filteredProposals = proposals.filter((proposal) => {
    const matchesStatus = !statusFilter || proposal.status === statusFilter;
    return matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleStatusUpdate = (proposalId: number, status: string) => {
    updateStatusMutation.mutate({ proposalId, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Proposals</h1>
          <p className="text-muted-foreground">
            Review and manage proposals for your job posting
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Proposals List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="space-y-6">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {proposal.freelancerName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{proposal.freelancerName}</h3>
                      <p className="text-sm text-muted-foreground">{proposal.freelancerTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{proposal.freelancerEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Skills */}
                {proposal.freelancerSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {proposal.freelancerSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Cover Letter */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Cover Letter</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {proposal.coverLetter}
                  </p>
                </div>

                <Separator />

                {/* Proposal Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="ml-1 font-semibold text-green-600">
                      ${proposal.proposedRate?.toLocaleString() || 'Not specified'}
                    </span>
                  </div>
                  
                  {proposal.estimatedDuration && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-1 font-medium">{proposal.estimatedDuration}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="ml-1 font-medium">{formatDate(proposal.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                {proposal.status === 'pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => handleStatusUpdate(proposal.id, 'accepted')}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept Proposal
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleStatusUpdate(proposal.id, 'rejected')}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No proposals found</h3>
          <p className="text-muted-foreground">
            {statusFilter ? 'Try adjusting your filters' : 'No freelancers have submitted proposals yet'}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ClientProposalsPage() {
  return (
    <ProtectedRoute requiredRole="client">
      <ClientProposalsPageContent />
    </ProtectedRoute>
  );
}