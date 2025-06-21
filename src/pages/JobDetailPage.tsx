
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  DollarSign, 
  Clock, 
  MapPin, 
  Briefcase,
  Star,
  Users,
  Calendar
} from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import React from 'react';
import { Separator } from '../components/ui/separator';

interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  category: string;
  skills: string[];
  experienceLevel: string;
  clientId: string;
  status: string;
  createdAt: string;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  status: string;
}

export default function JobDetailPage() {
  const [match, params] = useRoute('/jobs/:id');
  const jobId = params?.id;

  const { data: jobsData, isLoading } = useQuery<JobsResponse>({
    queryKey: ['/api/jobs'],
  });

  const job = jobsData?.jobs?.find(j => j.id.toString() === jobId);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="animate-pulse">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The job you're looking for doesn't exist or has been removed.
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Job Details</h1>
          <p className="text-muted-foreground">Review project requirements and submit your proposal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Posted {formatTimeAgo(job.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Remote</span>
                    </div>
                    <Badge>{job.category}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${job.budget.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Fixed Price</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose dark:prose-invert max-w-none">
                <p>{job.description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-semibold mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Experience Level</h4>
                  <Badge variant="secondary">{job.experienceLevel}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Project Type</h4>
                  <div className="flex items-center gap-1 text-sm">
                    <Briefcase className="h-4 w-4" />
                    <span>One-time project</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>About the Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {job.clientId}
                </div>
                <div>
                  <h4 className="font-semibold">Client #{job.clientId}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                    <span>•</span>
                    <span>25 jobs posted</span>
                    <span>•</span>
                    <span>$15K+ spent</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Member since</div>
                  <div className="text-muted-foreground">June 2023</div>
                </div>
                <div>
                  <div className="font-medium">Last seen</div>
                  <div className="text-muted-foreground">2 hours ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {user?.userType === 'freelancer' ? (
                  <Link href={`/jobs/${job.id}/apply`}>
                    <Button size="lg" className="w-full">
                      Submit Proposal
                    </Button>
                  </Link>
                ) : user?.userType === 'client' ? (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">
                      You are logged in as a client. Only freelancers can apply to jobs.
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-sm">
                      Please log in as a freelancer to apply for this job.
                    </p>
                  </div>
                )}
                <Button variant="outline" size="lg" className="w-full">
                  Save Job
                </Button>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Proposals</span>
                    <span className="font-medium">Less than 5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last viewed</span>
                    <span className="font-medium">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Interviewing</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Invites sent</span>
                    <span className="font-medium">2</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Similar Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Similar Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobsData?.jobs?.filter(j => j.id !== job.id && j.category === job.category).slice(0, 3).map((similarJob) => (
                <Link key={similarJob.id} href={`/jobs/${similarJob.id}`}>
                  <div className="p-3 border rounded hover:bg-accent transition-colors cursor-pointer">
                    <h4 className="font-medium text-sm mb-1">{similarJob.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>${similarJob.budget.toLocaleString()}</span>
                      <span>{formatTimeAgo(similarJob.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
              
              <Link href="/jobs">
                <Button variant="outline" size="sm" className="w-full">
                  View More Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}