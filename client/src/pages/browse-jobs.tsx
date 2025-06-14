import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/ui/navigation";
import JobCard from "@/components/ui/job-card";
import { Search, Filter } from "lucide-react";

export default function BrowseJobs() {
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    budgetMin: "",
    budgetMax: "",
    experienceLevel: "",
    sortBy: "newest",
    page: 0,
  });

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['/api/jobs', { ...filters, limit: 10, offset: filters.page * 10 }],
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0, // Reset to first page when filters change
    }));
  };

  const handleSearch = () => {
    // Trigger refetch with current filters
    setFilters(prev => ({ ...prev, page: 0 }));
  };

  const categories = [
    "Web Development",
    "Mobile Development", 
    "Graphic Design",
    "UI/UX Design",
    "Digital Marketing",
    "Content Writing",
    "Data Science",
    "DevOps",
    "Other"
  ];

  const experienceLevels = [
    { value: "entry", label: "Entry Level" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Jobs</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} className="bg-upwork-green hover:bg-upwork-dark">
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="budget_high">Budget: High to Low</SelectItem>
                <SelectItem value="budget_low">Budget: Low to High</SelectItem>
                <SelectItem value="proposals">Most Proposals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4" />
                  <h3 className="font-semibold">Filters</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Budget Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.budgetMin}
                        onChange={(e) => handleFilterChange("budgetMin", e.target.value)}
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.budgetMax}
                        onChange={(e) => handleFilterChange("budgetMax", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                    <div className="space-y-2">
                      {experienceLevels.map(level => (
                        <div key={level.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={level.value}
                            checked={filters.experienceLevel === level.value}
                            onCheckedChange={(checked) => 
                              handleFilterChange("experienceLevel", checked ? level.value : "")
                            }
                          />
                          <label htmlFor={level.value} className="text-sm">
                            {level.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSearch}
                    className="w-full bg-upwork-green hover:bg-upwork-dark"
                  >
                    Apply Filters
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setFilters({
                      search: "",
                      category: "all",
                      budgetMin: "",
                      budgetMax: "",
                      experienceLevel: "",
                      sortBy: "newest",
                      page: 0,
                    })}
                    className="w-full"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Jobs List */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobsData?.jobs?.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or browse all available jobs.
                  </p>
                  <Button 
                    onClick={() => setFilters({
                      search: "",
                      category: "",
                      budgetMin: "",
                      budgetMax: "",
                      experienceLevel: "",
                      sortBy: "newest",
                      page: 0,
                    })}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-gray-600">
                    Showing {jobsData?.jobs?.length || 0} of {jobsData?.total || 0} jobs
                  </p>
                </div>

                <div className="space-y-6">
                  {jobsData?.jobs?.map((job: any) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {jobsData?.total > 10 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex space-x-2">
                      <Button
                        variant="outline"
                        disabled={filters.page === 0}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      >
                        Previous
                      </Button>
                      
                      {[...Array(Math.ceil((jobsData?.total || 0) / 10))].map((_, i) => (
                        <Button
                          key={i}
                          variant={filters.page === i ? "default" : "outline"}
                          onClick={() => setFilters(prev => ({ ...prev, page: i }))}
                          className={filters.page === i ? "bg-upwork-green hover:bg-upwork-dark" : ""}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        disabled={filters.page >= Math.ceil((jobsData?.total || 0) / 10) - 1}
                        onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
