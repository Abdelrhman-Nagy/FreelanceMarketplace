
import { useQuery } from '@tanstack/react-query';
import { 
  Briefcase, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Users,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

interface StatsData {
  totalJobs: number;
  activeProposals: number;
  completedContracts: number;
  totalEarnings: number;
  status: string;
}

interface JobsResponse {
  jobs: Array<{
    id: number;
    title: string;
    status: string;
    budget: number;
    proposals: number;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ['/api/my-stats'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery<JobsResponse>({
    queryKey: ['/api/my-jobs'],
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: messagesData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread/count'],
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const stats = [
    {
      title: 'Total Projects',
      value: statsData?.totalJobs || 0,
      icon: Briefcase,
      description: 'Projects posted',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Active Proposals',
      value: statsData?.activeProposals || 0,
      icon: FileText,
      description: 'Pending proposals',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    },
    {
      title: 'Completed',
      value: statsData?.completedContracts || 0,
      icon: CheckCircle2,
      description: 'Finished projects',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      title: 'Total Earnings',
      value: `$${(statsData?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      description: 'Revenue generated',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your freelancing activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {messagesData && messagesData.count > 0 && (
            <Badge variant="destructive">
              {messagesData.count} new messages
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`w-8 h-8 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Recent Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : jobsData?.jobs?.length ? (
              <div className="space-y-3">
                {jobsData.jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded hover:bg-accent transition-colors">
                    <div className="space-y-1">
                      <h4 className="font-medium">{job.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${job.budget.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {job.proposals} proposals
                        </span>
                      </div>
                    </div>
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Jobs
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No jobs yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start by posting your first job to attract talented freelancers.
                </p>
                <Button>Post a Job</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Briefcase className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Browse Proposals
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Find Freelancers
            </Button>

            {/* Recent Activity Timeline */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">New proposal received</p>
                    <p className="text-muted-foreground">React Developer position</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">Project completed</p>
                    <p className="text-muted-foreground">Mobile App Development</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">Job posted</p>
                    <p className="text-muted-foreground">E-commerce Platform</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}