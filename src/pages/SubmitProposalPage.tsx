import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Send, DollarSign, Clock, Briefcase } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  description: string;
  budget: string;
  category: string;
  skills: string[];
  experienceLevel: string;
  clientName: string;
  clientCompany: string;
  createdAt: string;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  status: string;
}

export default function SubmitProposalPage() {
  const [, params] = useRoute('/jobs/:id/apply');
  const jobId = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');

  const { data: jobsData, isLoading } = useQuery<JobsResponse>({
    queryKey: ['/api/jobs'],
  });

  const job = jobsData?.jobs?.find(j => j.id.toString() === jobId);

  const submitProposal = useMutation({
    mutationFn: async (proposalData) => {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(proposalData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit proposal');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your proposal has been submitted successfully!",
      });
      setCoverLetter('');
      setProposedRate('');
      setEstimatedDuration('');
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit proposal",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coverLetter.trim()) {
      toast({
        title: "Error",
        description: "Please write a cover letter",
        variant: "destructive",
      });
      return;
    }

    submitProposal.mutate({
      jobId: parseInt(jobId!),
      coverLetter: coverLetter.trim(),
      proposedRate: parseFloat(proposedRate),
      estimatedDuration: estimatedDuration.trim()
    });
  };

  if (user?.userType !== 'freelancer') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">
          Only freelancers can submit proposals for jobs.
        </p>
        <Link href="/jobs">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The job you're trying to apply for doesn't exist or has been removed.
        </p>
        <Link href="/jobs">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/jobs/${jobId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Submit Proposal</h1>
          <p className="text-muted-foreground">Apply for this job with a personalized proposal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Proposal Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Cover Letter */}
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Introduce yourself and explain why you're the perfect fit for this project. Highlight your relevant experience and skills..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[200px]"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Tell the client about your experience and how you can help with their project.
                  </p>
                </div>

                {/* Proposed Rate */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposedRate">Proposed Rate ($/hour)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="proposedRate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="25.00"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your hourly rate for this project
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="estimatedDuration"
                        placeholder="2 weeks"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      How long will this project take?
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Link href={`/jobs/${jobId}`}>
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={submitProposal.isPending || !coverLetter.trim()}
                    className="min-w-[120px]"
                  >
                    {submitProposal.isPending ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Proposal
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Job Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{job.title}</h3>
                <Badge variant="secondary">{job.category}</Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-600">{job.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{job.experienceLevel} level</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Client</h4>
                <p className="text-sm text-muted-foreground">
                  {job.clientName}
                  {job.clientCompany && ` • ${job.clientCompany}`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips for Success</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Be Specific</h4>
                <p className="text-muted-foreground">
                  Explain exactly how you'll complete the project
                </p>
              </div>
              <div>
                <h4 className="font-medium">Show Relevant Work</h4>
                <p className="text-muted-foreground">
                  Mention similar projects you've completed
                </p>
              </div>
              <div>
                <h4 className="font-medium">Ask Questions</h4>
                <p className="text-muted-foreground">
                  Show you understand the project requirements
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}