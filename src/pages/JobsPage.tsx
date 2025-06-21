
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Search, MapPin, Clock, DollarSign, Bookmark } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';

interface Job {
  id: number;
  title: string;
  description: string;
  category: string;
  budgetType: string;
  budgetMin?: number;
  budgetMax?: number;
  experienceLevel: string;
  skills: string[];
  duration?: string;
  clientName: string;
  clientRating: number;
  postedAt: string;
  proposalCount: number;
}

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudgetType, setSelectedBudgetType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['/api/jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      return response.json();
    },
  });

  const jobs = jobsData?.jobs || [];

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    const matchesBudgetType = selectedBudgetType === 'all' || job.budgetType === selectedBudgetType;
    const matchesExperience = selectedExperience === 'all' || job.experienceLevel === selectedExperience;
    
    return matchesSearch && matchesCategory && matchesBudgetType && matchesExperience;
  });

  const handleSaveJob = async (jobId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save jobs.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Job saved successfully!",
        });
      } else {
        throw new Error('Failed to save job');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatBudget = (job: Job) => {
    if (job.budgetType === 'fixed') {
      if (job.budgetMin && job.budgetMax) {
        return `$${job.budgetMin} - $${job.budgetMax}`;
      }
      return job.budgetMin ? `$${job.budgetMin}` : 'Budget not specified';
    } else {
      return job.budgetMin ? `$${job.budgetMin}/hr` : 'Rate not specified';
    }
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Find Jobs</h1>
        <p className="text-muted-foreground">
          Discover opportunities that match your skills and interests
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Writing">Writing</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBudgetType} onValueChange={setSelectedBudgetType}>
              <SelectTrigger>
                <SelectValue placeholder="Budget Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budget Types</SelectItem>
                <SelectItem value="fixed">Fixed Price</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedExperience} onValueChange={setSelectedExperience}>
              <SelectTrigger>
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Entry Level">Entry Level</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job: Job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Link to={`/jobs/${job.id}`}>
                    <CardTitle className="hover:text-primary transition-colors cursor-pointer">
                      {job.title}
                    </CardTitle>
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatBudget(job)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {timeAgo(job.postedAt)}
                    </div>
                    <Badge variant="secondary">{job.category}</Badge>
                    <Badge variant="outline">{job.experienceLevel}</Badge>
                  </div>
                </div>
                {user?.userType === 'freelancer' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSaveJob(job.id)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4 line-clamp-3">
                {job.description}
              </CardDescription>
              
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {job.skills.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{job.skills.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {job.proposalCount} proposal{job.proposalCount !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  {user?.userType === 'freelancer' && (
                    <Link to={`/jobs/${job.id}`}>
                      <Button size="sm">
                        Submit Proposal
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredJobs.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No jobs found matching your criteria.</p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedBudgetType('all');
                setSelectedExperience('all');
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
