import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  Bookmark,
  Heart
} from "lucide-react";

interface JobCardProps {
  job: {
    id: number;
    title: string;
    description: string;
    budgetType: string;
    budgetMin?: number;
    budgetMax?: number;
    hourlyRate?: number;
    experienceLevel: string;
    skills?: string[];
    proposalCount: number;
    remote: boolean;
    createdAt: string;
    status: string;
  };
  showSaveButton?: boolean;
}

export default function JobCard({ job, showSaveButton = true }: JobCardProps) {
  const formatBudget = () => {
    if (job.budgetType === 'fixed') {
      return `$${job.budgetMin?.toLocaleString()} - $${job.budgetMax?.toLocaleString()}`;
    } else {
      return `$${job.hourlyRate}/hr`;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just posted';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <Link href={`/jobs/${job.id}`}>
              <h3 className="text-xl font-semibold text-gray-900 hover:text-upwork-green cursor-pointer mb-2">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {getTimeAgo(job.createdAt)}
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
          
          <div className="flex flex-col items-end">
            <div className="text-green-600 font-semibold text-lg mb-2">
              {formatBudget()}
            </div>
            <Badge variant="outline" className="mb-2">
              {job.experienceLevel}
            </Badge>
            {showSaveButton && (
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-upwork-green">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3">
          {job.description.length > 200 
            ? `${job.description.substring(0, 200)}...`
            : job.description
          }
        </p>

        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
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

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <Badge 
              variant={job.status === 'open' ? 'secondary' : 'outline'}
              className={job.status === 'open' ? 'bg-green-100 text-green-800' : ''}
            >
              {job.status.replace('_', ' ')}
            </Badge>
            <span>{job.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'}</span>
          </div>
          
          <Link href={`/jobs/${job.id}`}>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-upwork-green hover:text-white hover:border-upwork-green"
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
