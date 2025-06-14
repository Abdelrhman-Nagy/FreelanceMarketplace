import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  X, 
  DollarSign, 
  Clock, 
  FileText,
  AlertCircle
} from "lucide-react";

interface ProposalFormProps {
  job: {
    id: number;
    title: string;
    budgetType: string;
    budgetMin?: number;
    budgetMax?: number;
    hourlyRate?: number;
    skills?: string[];
  };
  onSubmit: (data: {
    coverLetter: string;
    proposedRate: number;
    timeline: string;
  }) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export default function ProposalForm({ job, onSubmit, onClose, isSubmitting }: ProposalFormProps) {
  const [formData, setFormData] = useState({
    coverLetter: "",
    proposedRate: "",
    timeline: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required";
    } else if (formData.coverLetter.length < 50) {
      newErrors.coverLetter = "Cover letter should be at least 50 characters";
    }

    if (!formData.proposedRate) {
      newErrors.proposedRate = "Proposed rate is required";
    } else {
      const rate = parseFloat(formData.proposedRate);
      if (isNaN(rate) || rate <= 0) {
        newErrors.proposedRate = "Please enter a valid rate";
      }
    }

    if (!formData.timeline.trim()) {
      newErrors.timeline = "Timeline is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      coverLetter: formData.coverLetter,
      proposedRate: parseFloat(formData.proposedRate),
      timeline: formData.timeline,
    });
  };

  const getBudgetRange = () => {
    if (job.budgetType === 'fixed') {
      return `$${job.budgetMin?.toLocaleString()} - $${job.budgetMax?.toLocaleString()}`;
    } else {
      return `$${job.hourlyRate}/hr`;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Submit Proposal</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-2">{job.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                <span className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {getBudgetRange()}
                </span>
                <Badge variant="outline">
                  {job.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly'}
                </Badge>
              </div>
              {job.skills && job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Letter */}
            <div>
              <Label htmlFor="coverLetter" className="text-base font-medium">
                Cover Letter *
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                Describe your experience and how you'll complete this project.
              </p>
              <Textarea
                id="coverLetter"
                placeholder="I'm excited to work on your project because..."
                value={formData.coverLetter}
                onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                className={`min-h-[120px] ${errors.coverLetter ? 'border-red-500' : ''}`}
              />
              {errors.coverLetter && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.coverLetter}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.coverLetter.length}/1000 characters
              </p>
            </div>

            {/* Proposed Rate */}
            <div>
              <Label htmlFor="proposedRate" className="text-base font-medium">
                Your {job.budgetType === 'fixed' ? 'Bid' : 'Hourly Rate'} *
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                {job.budgetType === 'fixed' 
                  ? 'Total amount you want to charge for this project'
                  : 'Your hourly rate for this project'
                }
              </p>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="proposedRate"
                  type="number"
                  step="0.01"
                  placeholder={job.budgetType === 'fixed' ? '2500' : '50'}
                  value={formData.proposedRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposedRate: e.target.value }))}
                  className={`pl-10 ${errors.proposedRate ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.proposedRate && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.proposedRate}
                </p>
              )}
              {job.budgetType === 'fixed' && (
                <p className="text-xs text-gray-500 mt-1">
                  Client's budget: {getBudgetRange()}
                </p>
              )}
            </div>

            {/* Timeline */}
            <div>
              <Label htmlFor="timeline" className="text-base font-medium">
                Timeline *
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                How long will it take you to complete this project?
              </p>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="timeline"
                  placeholder="e.g., 2 weeks, 1 month, 3-4 days"
                  value={formData.timeline}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  className={`pl-10 ${errors.timeline ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.timeline && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.timeline}
                </p>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Tips for a great proposal</h4>
                  <ul className="text-sm text-blue-800 mt-1 space-y-1">
                    <li>• Clearly state how you'll solve the client's problem</li>
                    <li>• Mention relevant experience and skills</li>
                    <li>• Ask clarifying questions if needed</li>
                    <li>• Be professional and personable</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-upwork-green hover:bg-upwork-dark"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
