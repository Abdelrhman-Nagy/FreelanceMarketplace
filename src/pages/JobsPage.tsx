import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, MapPin, Clock, DollarSign, Briefcase, AlertTriangle, Zap, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

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

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  const { data: jobsData, isLoading, error } = useQuery<JobsResponse>({
    queryKey: ['/api/jobs'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const jobs = jobsData?.jobs || [];
  const categories = ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing'];
  const urgencyLevels = ['urgent', 'high', 'normal', 'low'];

  // Debug logging
  console.log('JobsPage render - jobsData:', jobsData);
  console.log('JobsPage render - jobs:', jobs);
  console.log('JobsPage render - jobs length:', jobs.length);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    const matchesUrgency = !urgencyFilter || (job.urgencyLevel && job.urgencyLevel === urgencyFilter);
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  console.log('Filtered jobs count:', filteredJobs.length);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Find Your Perfect Project</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse through hundreds of projects posted by clients worldwide. Find opportunities that match your skills and expertise.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs by title, skills, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Urgency Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={urgencyFilter === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUrgencyFilter('')}
            >
              All Urgency
            </Button>
            <Button
              variant={urgencyFilter === 'urgent' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setUrgencyFilter('urgent')}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Zap className="h-4 w-4 mr-1" />
              Urgent
            </Button>
            <Button
              variant={urgencyFilter === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUrgencyFilter('high')}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              High
            </Button>
            <Button
              variant={urgencyFilter === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setUrgencyFilter('normal')}
            >
              Normal
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {isLoading ? 'Loading...' : `${filteredJobs.length} jobs found`}
          </p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Error loading jobs</h3>
            <p className="text-muted-foreground">
              Unable to load jobs at the moment. Please try again later.
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className={`hover:shadow-md transition-all duration-300 ${
                job.urgencyLevel === 'urgent' || job.isUrgent 
                  ? 'border-l-4 border-l-red-500 bg-red-50/20' 
                  : job.urgencyLevel === 'high'
                  ? 'border-l-4 border-l-orange-500 bg-orange-50/20'
                  : 'hover:shadow-md'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start gap-2">
                        <CardTitle className="text-xl flex-1">
                          <Link href={`/jobs/${job.id}`} className="hover:text-primary transition-colors">
                            {job.title}
                          </Link>
                        </CardTitle>
                        {getUrgencyBadge(job.priority, job.isUrgent)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-green-600">{job.budget}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTimeAgo(job.createdAt)}</span>
                        </div>
                        <Badge variant="secondary">{job.experienceLevel}</Badge>
                      </div>
                    </div>
                    <Badge>{job.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-3">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Remote</span>
                    </div>
                    <Link href={`/jobs/${job.id}`}>
                      <Button>Apply Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all categories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}