import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Calendar, DollarSign, MapPin, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

interface SavedJob {
  id: number;
  jobId: number;
  jobTitle: string;
  jobDescription: string;
  budget: number;
  category: string;
  clientName: string;
  clientCompany: string;
  savedAt: string;
}

interface SavedJobsResponse {
  savedJobs: SavedJob[];
  total: number;
  status: string;
}

export default function SavedJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: savedJobsData, isLoading } = useQuery<SavedJobsResponse>({
    queryKey: ['/api/saved-jobs'],
  });

  const savedJobs = savedJobsData?.savedJobs || [];

  const filteredJobs = savedJobs.filter((job) => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.jobDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Saved Jobs</h1>
          <p className="text-muted-foreground">
            Jobs you've saved for later consideration
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search saved jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{job.jobTitle}</CardTitle>
                  <Bookmark className="w-5 h-5 text-primary fill-current" />
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <Badge variant="secondary">{job.category}</Badge>
                  <span className="font-semibold text-green-600">
                    ${job.budget.toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {job.jobDescription}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{job.clientName}</span>
                    {job.clientCompany && (
                      <span className="ml-1">• {job.clientCompany}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Saved on {formatDate(job.savedAt)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/jobs/${job.jobId}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View Job
                    </Button>
                  </Link>
                  <Button size="sm" className="flex-1">
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No saved jobs found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Start saving jobs that interest you'}
          </p>
          <Link href="/jobs">
            <Button>
              <Search className="w-4 h-4 mr-2" />
              Browse Jobs
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}