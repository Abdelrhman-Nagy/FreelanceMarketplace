import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertJobSchema } from "@shared/schema";
import { Navigation } from "@/components/ui/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";

const postJobSchema = insertJobSchema.extend({
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(), 
  hourlyRate: z.number().optional(),
}).refine((data) => {
  if (data.budgetType === "fixed") {
    return data.budgetMin !== undefined && data.budgetMax !== undefined && data.budgetMin > 0 && data.budgetMax > data.budgetMin;
  }
  if (data.budgetType === "hourly") {
    return data.hourlyRate !== undefined && data.hourlyRate > 0;
  }
  return true;
}, {
  message: "Budget information is required based on budget type",
  path: ["budgetType"]
});

type PostJobForm = z.infer<typeof postJobSchema>;

const skillOptions = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Django", "Flask",
  "Java", "Spring", "PHP", "Laravel", "Ruby", "Rails", "Go", "Rust",
  "HTML", "CSS", "Sass", "Tailwind CSS", "Bootstrap", "Vue.js", "Angular",
  "React Native", "Flutter", "Swift", "Kotlin", "C#", ".NET",
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST API",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "DevOps",
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator",
  "Mobile Design", "Web Design", "Branding", "Logo Design",
  "Data Science", "Machine Learning", "AI", "TensorFlow", "PyTorch",
  "Data Analysis", "Pandas", "NumPy", "Matplotlib", "Tableau",
  "SEO", "Content Writing", "Copywriting", "Digital Marketing",
  "Social Media Marketing", "Email Marketing", "PPC", "Analytics"
];

const categories = [
  "Web Development",
  "Mobile Development", 
  "UI/UX Design",
  "Data Science",
  "DevOps",
  "Digital Marketing",
  "Content Writing",
  "Graphic Design",
  "Video Editing",
  "Other"
];

const experienceLevels = [
  { value: "entry", label: "Entry Level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" }
];

export default function PostJob() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const form = useForm<PostJobForm>({
    resolver: zodResolver(postJobSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      budgetType: "fixed",
      experienceLevel: "intermediate",
      remote: true,
      skills: []
    }
  });

  const budgetType = form.watch("budgetType");

  const postJobMutation = useMutation({
    mutationFn: async (data: PostJobForm) => {
      return await apiRequest("POST", "/api/jobs", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job posted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post job. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: PostJobForm) => {
    const jobData = {
      ...data,
      skills: selectedSkills,
      budgetMin: data.budgetType === "fixed" ? data.budgetMin : undefined,
      budgetMax: data.budgetType === "fixed" ? data.budgetMax : undefined,
      hourlyRate: data.budgetType === "hourly" ? data.hourlyRate : undefined
    };
    
    postJobMutation.mutate(jobData);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      const updated = prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill];
      form.setValue("skills", updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-3">
            <Briefcase className="w-8 h-8 text-upwork-green" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
              <p className="text-gray-600">Find the perfect freelancer for your project</p>
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Title */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Build a React Dashboard Application"
                  {...form.register("title")}
                  className="mt-1"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => form.setValue("category", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project in detail..."
                  rows={6}
                  {...form.register("description")}
                  className="mt-1"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle>Budget & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Budget Type *</Label>
                <RadioGroup
                  value={budgetType}
                  onValueChange={(value) => form.setValue("budgetType", value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed Price Project</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly">Hourly Rate</Label>
                  </div>
                </RadioGroup>
              </div>

              {budgetType === "fixed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetMin">Minimum Budget ($) *</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      placeholder="1000"
                      {...form.register("budgetMin", { valueAsNumber: true })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetMax">Maximum Budget ($) *</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      placeholder="5000"
                      {...form.register("budgetMax", { valueAsNumber: true })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {budgetType === "hourly" && (
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    placeholder="50"
                    {...form.register("hourlyRate", { valueAsNumber: true })}
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label>Experience Level *</Label>
                <RadioGroup
                  defaultValue="intermediate"
                  onValueChange={(value) => form.setValue("experienceLevel", value)}
                  className="mt-2"
                >
                  {experienceLevels.map(level => (
                    <div key={level.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={level.value} id={level.value} />
                      <Label htmlFor={level.value}>{level.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {skillOptions.map(skill => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={() => toggleSkill(skill)}
                    />
                    <Label htmlFor={skill} className="text-sm">{skill}</Label>
                  </div>
                ))}
              </div>
              {form.formState.errors.skills && (
                <p className="text-red-500 text-sm mt-2">{form.formState.errors.skills.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Project Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Project Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  defaultChecked={true}
                  onCheckedChange={(checked) => form.setValue("remote", checked === true)}
                />
                <Label htmlFor="remote">This is a remote job</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-upwork-green hover:bg-upwork-dark text-white"
              disabled={postJobMutation.isPending}
            >
              {postJobMutation.isPending ? "Posting..." : "Post Job"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}