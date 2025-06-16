
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Search, Briefcase, Users, Award, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

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

export default function HomePage() {
  const { data: jobsData, isLoading } = useQuery<JobsResponse>({
    queryKey: ['/api/jobs'],
  });

  const featuredJobs = jobsData?.jobs?.slice(0, 3) || [];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Find Your Next Freelance Opportunity
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with top clients, showcase your skills, and build a successful freelance career on FreelanceHub.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/jobs">
            <Button size="lg" className="w-full sm:w-auto">
              <Search className="mr-2 h-5 w-5" />
              Find Jobs
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Briefcase className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold">1,000+</h3>
          <p className="text-muted-foreground">Active Jobs</p>
        </div>
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold">10,000+</h3>
          <p className="text-muted-foreground">Freelancers</p>
        </div>
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
            <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold">95%</h3>
          <p className="text-muted-foreground">Success Rate</p>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Featured Jobs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover high-quality projects from verified clients across various industries.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{job.category}</span>
                    <span className="font-semibold text-green-600">${job.budget.toLocaleString()}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 3 && (
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs">
                        +{job.skills.length - 3} more
                      </span>
                    )}
                  </div>
                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link href="/jobs">
            <Button variant="outline" size="lg">
              View All Jobs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Start Your Freelance Journey?
        </h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of successful freelancers who have built their careers on FreelanceHub.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/jobs">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Browse Jobs
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}