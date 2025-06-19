import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Send, Calendar, DollarSign, Eye, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute, FreelancerOnlyRoute } from '../components/ProtectedRoute';

interface Proposal {
  id: number;
  jobId: number;
  jobTitle: string;
  clientName: string;
  coverLetter: string;
  proposedRate: number;
  estimatedDuration: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ProposalsResponse {
  proposals: Proposal[];
  total: number;
  status: string;
}

function ProposalsPageContent() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: proposalsData, isLoading } = useQuery<ProposalsResponse>({
    queryKey: [`/api/proposals/user/${user?.id}`],
    enabled: !!user,
  });

  const proposals = proposalsData?.proposals || [];

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch = proposal.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || proposal.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <Send className="w-4 h-4" />;
      case 'rejected': return <Eye className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Proposals</h1>
          <p className="text-muted-foreground">
            Track the status of your job proposals
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search proposals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
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
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
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
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{proposal.jobTitle}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Client: {proposal.clientName}</span>
                      <span>•</span>
                      <span>Submitted: {formatDate(proposal.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(proposal.status)}
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {proposal.coverLetter}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {proposal.proposedRate && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span className="font-semibold text-green-600">
                          ${proposal.proposedRate.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {proposal.estimatedDuration && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">{proposal.estimatedDuration}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/jobs/${proposal.jobId}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View Job
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No proposals found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Start applying to jobs that match your skills'}
          </p>
          <Link href="/jobs">
            <Button>
              <Eye className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <FreelancerOnlyRoute>
      <ProposalsPageContent />
    </FreelancerOnlyRoute>
  );
}