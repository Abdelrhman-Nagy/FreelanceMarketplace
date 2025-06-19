import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  DollarSign, 
  Clock, 
  MapPin, 
  Briefcase, 
  Plus, 
  X,
  AlertCircle 
} from 'lucide-react';

export default function PostJobPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budgetType: '' as 'fixed' | 'hourly' | '',
    budgetMin: '',
    budgetMax: '',
    hourlyRate: '',
    experienceLevel: '',
    duration: '',
    remote: false,
    skills: [] as string[],
    requirements: '',
  });

  const [newSkill, setNewSkill] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Data Science',
    'Digital Marketing',
    'Content Writing',
    'Graphic Design',
    'Video Editing',
    'Translation',
    'Virtual Assistant'
  ];

  const experienceLevels = [
    'Entry Level',
    'Intermediate',
    'Expert'
  ];

  const durations = [
    'Less than 1 month',
    '1-3 months',
    '3-6 months',
    'More than 6 months'
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.budgetType) {
      toast({
        title: "Budget type required",
        description: "Please select a budget type.",
        variant: "destructive",
      });
      return;
    }

    if (formData.budgetType === 'fixed' && (!formData.budgetMin || !formData.budgetMax)) {
      toast({
        title: "Budget range required",
        description: "Please specify the budget range for fixed projects.",
        variant: "destructive",
      });
      return;
    }

    if (formData.budgetType === 'hourly' && !formData.hourlyRate) {
      toast({
        title: "Hourly rate required",
        description: "Please specify the hourly rate.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clientId: user?.id,
          skills: JSON.stringify(formData.skills),
        }),
      });

      if (response.ok) {
        toast({
          title: "Job posted successfully!",
          description: "Your job posting is now live and visible to freelancers.",
        });
        setLocation('/jobs');
      } else {
        throw new Error('Failed to post job');
      }
    } catch (error) {
      toast({
        title: "Error posting job",
        description: "Unable to post your job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.userType !== 'client') {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
        <p className="text-muted-foreground mb-6">
          Only clients can post jobs. Please log in with a client account.
        </p>
        <Button onClick={() => setLocation('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post a New Job</h1>
        <p className="text-muted-foreground">Find the perfect freelancer for your project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the essential details about your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Build a React E-commerce Website"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your project in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Specific requirements, deliverables, or constraints..."
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget and Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Budget and Timeline</CardTitle>
            <CardDescription>
              Set your budget and project duration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Budget Type *</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.budgetType === 'fixed' ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => handleInputChange('budgetType', 'fixed')}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    <span className="font-medium">Fixed Price</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pay a fixed amount for the entire project
                  </p>
                </div>
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.budgetType === 'hourly' ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onClick={() => handleInputChange('budgetType', 'hourly')}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Hourly Rate</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pay based on hours worked
                  </p>
                </div>
              </div>
            </div>

            {formData.budgetType === 'fixed' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">Minimum Budget ($)</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    placeholder="1000"
                    value={formData.budgetMin}
                    onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">Maximum Budget ($)</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    placeholder="2000"
                    value={formData.budgetMax}
                    onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                  />
                </div>
              </div>
            )}

            {formData.budgetType === 'hourly' && (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="25"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  className="w-32"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="duration">Project Duration</Label>
              <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Skills and Requirements */}
        <Card>
          <CardHeader>
            <CardTitle>Skills and Experience</CardTitle>
            <CardDescription>
              Specify the skills and experience level needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote"
                checked={formData.remote}
                onCheckedChange={(checked) => handleInputChange('remote', checked as boolean)}
              />
              <Label htmlFor="remote" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Remote work allowed
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setLocation('/jobs')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Briefcase className="h-4 w-4 mr-2" />
            {isLoading ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}