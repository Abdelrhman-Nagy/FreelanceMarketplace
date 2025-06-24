import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Star, MapPin, DollarSign, User, Search, Filter } from 'lucide-react';

interface Freelancer {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  experience: string;
  profileImage?: string;
}

interface FreelancersResponse {
  freelancers: Freelancer[];
  total: number;
  status: string;
}

export default function FreelancersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  const { data: freelancersData, isLoading } = useQuery<FreelancersResponse>({
    queryKey: ['/api/freelancers'],
  });

  const freelancers = freelancersData?.freelancers || [];

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch = 
      freelancer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSkill = !skillFilter || 
      freelancer.skills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()));
    
    const matchesExperience = !experienceFilter || 
      freelancer.experience === experienceFilter;

    return matchesSearch && matchesSkill && matchesExperience;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading freelancers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Freelancers</h1>
        <p className="text-gray-600">Discover talented freelancers for your projects</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, title, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Filter by skill..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="flex-1"
          />
          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Experience Levels</option>
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          {filteredFreelancers.length} freelancer{filteredFreelancers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Freelancers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFreelancers.map((freelancer) => (
          <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={freelancer.profileImage} />
                  <AvatarFallback>
                    {getInitials(freelancer.firstName, freelancer.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {freelancer.firstName} {freelancer.lastName}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{freelancer.title}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Rating and Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {renderStars(freelancer.rating)}
                  <span className="text-sm text-gray-600 ml-2">
                    {freelancer.rating}/5
                  </span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {freelancer.experience}
                </Badge>
              </div>

              {/* Bio */}
              {freelancer.bio && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {freelancer.bio}
                </p>
              )}

              {/* Skills */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {freelancer.skills.slice(0, 4).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {freelancer.skills.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{freelancer.skills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rate and Location */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${freelancer.hourlyRate}/hr
                </div>
                {freelancer.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {freelancer.location}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{freelancer.completedJobs} jobs completed</span>
                <span>{freelancer.totalJobs} total jobs</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm">
                  <User className="h-4 w-4 mr-1" />
                  View Profile
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFreelancers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No freelancers found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        </div>
      )}
    </div>
  );
}