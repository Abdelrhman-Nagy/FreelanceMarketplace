import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Navigation } from "@/components/ui/navigation";
import ProposalForm from "@/components/ui/proposal-form";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Star,
  Briefcase,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";

export default function JobDetail() {
  const { id } = useParams();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showProposalForm, setShowProposalForm] = useState(false);

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

  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: [`/api/jobs/${id}`],
    enabled: !!id,
  });

  const { data: proposals, isLoading: isProposalsLoading } = useQuery({
    queryKey: [`/api/jobs/${id}/proposals`],
    enabled: !!id && !!user && job?.client?.id === user.id,
  });

  const { data: myProposals } = useQuery({
    queryKey: ["/api/my-proposals"],
    enabled: !!user && user.userType === 'freelancer',
  });

  const submitProposalMutation = useMutation({
    mutationFn: async (proposalData: any) => {
      await apiRequest("POST", "/api/proposals", { ...proposalData, jobId: parseInt(id!) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-proposals"] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}/proposals`] });
      setShowProposalForm(false);
      toast({
        title: "Success",
        description: "Proposal submitted successfully",
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
        description: "Failed to submit proposal",
        variant: "destructive",
      });
    },
  });

  const acceptProposalMutation = useMutation({
    mutationFn: async (proposalId: number) => {
      const proposal = proposals.find((p: any) => p.id === proposalId);
      await apiRequest("POST", "/api/contracts", {
        jobId: parseInt(id!),
        freelancerId: proposal.freelancerId,
        clientId: user!.id,
        proposalId: proposalId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${id}/proposals`] });
      toast({
        title: "Success",
        description: "Proposal accepted and contract created",
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
        description: "Failed to accept proposal",
        variant: "destructive",
      });
    },
  });

  if (isLoading || isJobLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
              <p className="text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isFreelancer = user?.userType === 'freelancer';
  const isJobOwner = user?.id === job.client?.id;
  const hasApplied = myProposals?.some((p: any) => p.jobId === parseInt(id!));
  const canApply = isFreelancer && !hasApplied && job.status === 'open';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center text-gray-600 space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.remote ? 'Remote' : 'On-site'}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {job.proposalCount} proposals
                      </span>
                    </div>
                  </div>
                  <Badge variant={job.status === 'open' ? 'secondary' : 'default'}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center space-x-6 mb-6">
                  <div>
                    <span className="text-sm text-gray-500">Budget</span>
                    <p className="text-xl font-semibold text-green-600">
                      {job.budgetType === 'fixed' 
                        ? `$${job.budgetMin} - $${job.budgetMax}`
                        : `$${job.hourlyRate}/hr`
                      }
                    </p>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div>
                    <span className="text-sm text-gray-500">Experience Level</span>
                    <p className="font-medium capitalize">{job.experienceLevel}</p>
                  </div>
                  <Separator orientation="vertical" className="h-12" />
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <p className="font-medium">{job.category}</p>
                  </div>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Job Description</h3>
                  <div className="prose prose-sm max-w-none text-gray-700">
                    {job.description.split('\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            {job.client && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={job.client.profileImageUrl || ""} />
                      <AvatarFallback>
                        {job.client.firstName?.[0]}{job.client.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {job.client.firstName} {job.client.lastName}
                      </h4>
                      {job.client.company && (
                        <p className="text-sm text-gray-600">{job.client.company}</p>
                      )}
                      {job.client.location && (
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {job.client.location}
                        </p>
                      )}
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm">4.8 (25 reviews)</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-sm">Payment verified</span>
                        </div>
                      </div>
                      {job.client.bio && (
                        <p className="text-sm text-gray-600 mt-3">{job.client.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proposals (for job owner) */}
            {isJobOwner && proposals && (
              <Card>
                <CardHeader>
                  <CardTitle>Proposals ({proposals.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {isProposalsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse border rounded-lg p-4">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : proposals.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                      <p className="text-gray-600">Freelancers will start submitting proposals soon.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {proposals.map((proposal: any) => (
                        <div key={proposal.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={proposal.freelancer.profileImageUrl || ""} />
                                <AvatarFallback>
                                  {proposal.freelancer.firstName?.[0]}{proposal.freelancer.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium">
                                  {proposal.freelancer.firstName} {proposal.freelancer.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">{proposal.freelancer.title}</p>
                                <div className="flex items-center mt-1">
                                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                  <span className="text-sm">4.9 (15 reviews)</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">${proposal.proposedRate}</p>
                              <Badge variant={
                                proposal.status === 'accepted' ? 'default' :
                                proposal.status === 'rejected' ? 'destructive' :
                                'secondary'
                              }>
                                {proposal.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{proposal.coverLetter}</p>
                          
                          {proposal.timeline && (
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Timeline: {proposal.timeline}</span>
                            </div>
                          )}

                          {proposal.status === 'submitted' && (
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => acceptProposalMutation.mutate(proposal.id)}
                                disabled={acceptProposalMutation.isPending}
                                className="bg-upwork-green hover:bg-upwork-dark"
                              >
                                Accept Proposal
                              </Button>
                              <Button variant="outline">
                                Message
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply/Action Card */}
            <Card>
              <CardContent className="p-6">
                {canApply ? (
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Apply for this job</h3>
                    <p className="text-gray-600 text-sm mb-6">
                      Send a proposal to {job.client?.firstName} for this job and get hired.
                    </p>
                    <Button 
                      onClick={() => setShowProposalForm(true)}
                      className="w-full bg-upwork-green hover:bg-upwork-dark"
                    >
                      Submit Proposal
                    </Button>
                  </div>
                ) : hasApplied ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Proposal Submitted</h3>
                    <p className="text-gray-600 text-sm">
                      You have already submitted a proposal for this job.
                    </p>
                  </div>
                ) : !isFreelancer ? (
                  <div className="text-center">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Client View</h3>
                    <p className="text-gray-600 text-sm">
                      You are viewing this job as a client.
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Job Closed</h3>
                    <p className="text-gray-600 text-sm">
                      This job is no longer accepting proposals.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Job Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Proposals</span>
                  <span className="font-medium">{job.proposalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interviewing</span>
                  <span className="font-medium">
                    {proposals?.filter((p: any) => p.status === 'interviewing').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hired</span>
                  <span className="font-medium">
                    {proposals?.filter((p: any) => p.status === 'accepted').length || 0}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Type</span>
                  <span className="font-medium capitalize">{job.budgetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Project Size</span>
                  <span className="font-medium">Medium</span>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-l-4 border-upwork-green pl-3">
                    <h4 className="font-medium text-sm">React Dashboard Development</h4>
                    <p className="text-xs text-gray-600">$2,500 - $4,000</p>
                  </div>
                  <div className="border-l-4 border-gray-200 pl-3">
                    <h4 className="font-medium text-sm">Frontend Web Application</h4>
                    <p className="text-xs text-gray-600">$60/hr</p>
                  </div>
                  <div className="border-l-4 border-gray-200 pl-3">
                    <h4 className="font-medium text-sm">Mobile App UI Design</h4>
                    <p className="text-xs text-gray-600">$1,500 - $3,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Proposal Form Modal */}
        {showProposalForm && (
          <ProposalForm
            job={job}
            onSubmit={(data) => submitProposalMutation.mutate(data)}
            onClose={() => setShowProposalForm(false)}
            isSubmitting={submitProposalMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}
