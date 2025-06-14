import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import { Link } from "wouter";
import { 
  Briefcase, 
  DollarSign, 
  Star, 
  Clock,
  Plus,
  MessageCircle,
  TrendingUp
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['/api/my-stats'],
    enabled: !!user,
  });

  const { data: recentJobs } = useQuery({
    queryKey: ['/api/jobs', { limit: 6 }],
  });

  const { data: myJobs } = useQuery({
    queryKey: ['/api/my-jobs'],
    enabled: !!user && user.userType === 'client',
  });

  const { data: myProposals } = useQuery({
    queryKey: ['/api/my-proposals'],
    enabled: !!user && user.userType === 'freelancer',
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['/api/messages/unread/count'],
    enabled: !!user,
  });

  const isFreelancer = user?.userType === 'freelancer';
  const isClient = user?.userType === 'client';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-600">
            {isFreelancer && "Ready to find your next great project?"}
            {isClient && "Ready to find the perfect freelancer for your project?"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {isFreelancer && (
              <Link href="/browse-jobs">
                <Button className="bg-upwork-green hover:bg-upwork-dark text-white">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            )}
            {isClient && (
              <Link href="/post-job">
                <Button className="bg-upwork-green hover:bg-upwork-dark text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Post a Job
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="outline" className="relative">
                <MessageCircle className="w-4 h-4 mr-2" />
                Messages
                {unreadCount?.count > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs">
                    {unreadCount.count}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isFreelancer && myProposals?.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals yet</h3>
                    <p className="text-gray-600 mb-4">Start by browsing available jobs and submitting proposals.</p>
                    <Link href="/browse-jobs">
                      <Button className="bg-upwork-green hover:bg-upwork-dark text-white">
                        Browse Jobs
                      </Button>
                    </Link>
                  </div>
                )}

                {isClient && myJobs?.length === 0 && (
                  <div className="text-center py-8">
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                    <p className="text-gray-600 mb-4">Post your first job to start finding talented freelancers.</p>
                    <Link href="/post-job">
                      <Button className="bg-upwork-green hover:bg-upwork-dark text-white">
                        Post a Job
                      </Button>
                    </Link>
                  </div>
                )}

                {isFreelancer && myProposals && myProposals.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Proposals</h4>
                    {myProposals.slice(0, 3).map((proposal: any) => (
                      <div key={proposal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h5 className="font-medium">{proposal.job.title}</h5>
                          <p className="text-sm text-gray-600">
                            Proposed: ${proposal.proposedRate}
                          </p>
                        </div>
                        <Badge variant={
                          proposal.status === 'accepted' ? 'default' :
                          proposal.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {proposal.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {isClient && myJobs && myJobs.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Jobs</h4>
                    {myJobs.slice(0, 3).map((job: any) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h5 className="font-medium">{job.title}</h5>
                          <p className="text-sm text-gray-600">
                            {job.proposalCount} proposals
                          </p>
                        </div>
                        <Badge variant={
                          job.status === 'open' ? 'secondary' :
                          job.status === 'in_progress' ? 'default' :
                          'outline'
                        }>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Featured Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                {recentJobs?.jobs?.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                    <p className="text-gray-600">Check back soon for new opportunities.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentJobs?.jobs?.slice(0, 3).map((job: any) => (
                      <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/jobs/${job.id}`}>
                            <h5 className="font-medium hover:text-upwork-green cursor-pointer">
                              {job.title}
                            </h5>
                          </Link>
                          <div className="text-green-600 font-semibold">
                            {job.budgetType === 'fixed' 
                              ? `$${job.budgetMin} - $${job.budgetMax}`
                              : `$${job.hourlyRate}/hr`
                            }
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {job.description.length > 150 
                            ? `${job.description.substring(0, 150)}...`
                            : job.description
                          }
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            <span>{job.proposalCount} proposals</span>
                          </div>
                          <Badge variant="outline">{job.experienceLevel}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isFreelancer && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-upwork-green mr-2" />
                        <span className="text-sm">Active Proposals</span>
                      </div>
                      <span className="font-semibold">{myProposals?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <span className="font-semibold">4.9</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm">This Month</span>
                      </div>
                      <span className="font-semibold">$2,450</span>
                    </div>
                  </>
                )}

                {isClient && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-upwork-green mr-2" />
                        <span className="text-sm">Active Jobs</span>
                      </div>
                      <span className="font-semibold">{myJobs?.filter((j: any) => j.status === 'open').length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm">Total Posted</span>
                      </div>
                      <span className="font-semibold">{myJobs?.length || 0}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm">Unread Messages</span>
                  </div>
                  <span className="font-semibold">{unreadCount?.count || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Strength</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Profile Completion</span>
                      <span className="text-upwork-green font-medium">
                        {user.profileImageUrl && user.bio && user.skills ? '85%' : '45%'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-upwork-green h-2 rounded-full" 
                        style={{ 
                          width: user.profileImageUrl && user.bio && user.skills ? '85%' : '45%' 
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        {user.profileImageUrl ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        ) : (
                          <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        )}
                        <span>Profile photo</span>
                      </div>
                      <div className="flex items-center">
                        {user.bio ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        ) : (
                          <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        )}
                        <span>Professional bio</span>
                      </div>
                      <div className="flex items-center">
                        {user.skills && user.skills.length > 0 ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        ) : (
                          <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        )}
                        <span>Skills added</span>
                      </div>
                    </div>
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full mt-4">
                        Complete Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
