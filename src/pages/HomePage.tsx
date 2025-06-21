
import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, DollarSign, Star, Users, Briefcase, CheckCircle, Clock, ArrowRight, Plus, Zap, AlertTriangle } from 'lucide-react';

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
  proposalCount: number;
  isUrgent: boolean;
  urgencyLevel: string;
  deadline?: string;
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  status: string;
}

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const { data: jobsData } = useQuery<JobsResponse>({
    queryKey: ['/api/jobs'],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  const recentJobs = jobsData?.jobs?.slice(0, 6) || [];

  // Animated words for non-authenticated users
  const animatedWords = ['Perfect', 'Dream', 'Ideal', 'Amazing'];
  
  // Animated words for authenticated users
  const welcomeWords = ['Welcome back', 'Great to see you', 'Ready to work', 'Time to shine'];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % (isAuthenticated ? welcomeWords.length : animatedWords.length));
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, welcomeWords.length, animatedWords.length]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getUrgencyBadge = (urgencyLevel: string, isUrgent: boolean) => {
    if (urgencyLevel === 'urgent' || isUrgent) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
          <Zap className="h-3 w-3 mr-1" />
          Urgent
        </Badge>
      );
    }
    if (urgencyLevel === 'high') {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          High Priority
        </Badge>
      );
    }
    return null;
  };

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your{' '}
              <span 
                className={`inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500 transform ${
                  isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
                }`}
              >
                {animatedWords[currentWordIndex]}
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                Freelance Match
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with talented professionals and get your projects done right. 
              Join thousands of successful collaborations on our platform.
            </p>
            
            <div className="space-x-4">
              <Link href="/register">
                <Button size="lg" className="px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to succeed in the freelance marketplace
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Find the Right Talent</CardTitle>
                <CardDescription>
                  Browse through thousands of skilled freelancers and find the perfect match for your project
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Protected transactions with milestone-based payments ensure everyone gets paid fairly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>
                  Review system and portfolio verification ensure you work with top-quality professionals
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Active Freelancers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">5,000+</div>
                <div className="text-gray-600">Completed Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Your Project</h3>
              <p className="text-gray-600">
                Describe your project requirements and set your budget
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Review Proposals</h3>
              <p className="text-gray-600">
                Receive proposals from qualified freelancers and choose the best fit
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Results</h3>
              <p className="text-gray-600">
                Work with your chosen freelancer and receive high-quality results
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of successful projects on our platform
            </p>
            <div className="space-x-4">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="px-8 py-3">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For authenticated users, show personalized home with jobs
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span 
              className={`inline-block transition-all duration-500 transform ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
              }`}
            >
              {welcomeWords[currentWordIndex]}
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-bounce">
              {user?.firstName}!
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {user?.role === 'client' 
              ? "Manage your projects and find talented freelancers to bring your vision to life"
              : "Discover new opportunities and take your freelancing career to the next level"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.role === 'client' ? (
              <>
                <Link href="/post-job">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-5 w-5" />
                    Post a Job
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Browse Talent
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/jobs">
                  <Button size="lg" className="w-full sm:w-auto">
                    Find Jobs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
      {recentJobs.length > 0 && (
        <section className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  <span className="animate-pulse bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Latest
                  </span>{' '}
                  <span className="animate-bounce">
                    Opportunities
                  </span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Fresh job postings that match your expertise
                </p>
              </div>
              <Link href="/jobs">
                <Button variant="outline">
                  View All Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentJobs.map((job) => (
                <Card key={job.id} className={`hover:shadow-lg transition-all duration-300 ${
                  job.urgencyLevel === 'urgent' || job.isUrgent 
                    ? 'border-l-4 border-l-red-500 bg-red-50/30 animate-pulse' 
                    : job.urgencyLevel === 'high'
                    ? 'border-l-4 border-l-orange-500 bg-orange-50/30'
                    : 'border-l-4 border-l-blue-500'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <CardTitle className="text-lg line-clamp-2 hover:text-blue-600 transition-all duration-300 hover:animate-pulse flex-1">
                            <Link href={`/jobs/${job.id}`}>
                              {job.title}
                            </Link>
                          </CardTitle>
                          {getUrgencyBadge(job.urgencyLevel, job.isUrgent)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{job.clientName}</span>
                          {job.clientCompany && (
                            <>
                              <span>•</span>
                              <span>{job.clientCompany}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        {job.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                      {job.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-green-600 font-semibold">
                          <DollarSign className="h-4 w-4" />
                          {job.budget}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          {formatTimeAgo(job.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className="text-xs">
                          {job.experienceLevel}
                        </Badge>
                        <span className="text-gray-500">
                          {job.proposalCount} {job.proposalCount === 1 ? 'proposal' : 'proposals'}
                        </span>
                      </div>

                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-bounce">
                {jobsData?.total || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Active Jobs
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse">
                50,000+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Freelancers
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-bounce">
                $2M+
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Total Earned
              </div>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <CheckCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse">
                98%
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Success Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            <span className="animate-pulse">Ready for Your</span>{' '}
            <span className="animate-bounce bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Next Project?
            </span>
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {user?.role === 'client' 
              ? "Post your project and connect with talented freelancers ready to bring your vision to life"
              : "Explore new opportunities and take your freelancing career to the next level"
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user?.role === 'client' ? (
              <>
                <Link href="/post-job">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-5 w-5" />
                    Post a Job
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
                    Browse Talent
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/jobs">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Find Jobs
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
                    Update Profile
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;