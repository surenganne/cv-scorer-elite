import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Briefcase, FileText, Code, Clock, Award } from "lucide-react";

interface JobRequirementsProps {
  jobTitle: string;
  setJobTitle: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;
  requiredSkills: string;
  setRequiredSkills: (value: string) => void;
  minimumExperience: string;
  setMinimumExperience: (value: string) => void;
  preferredQualifications: string;
  setPreferredQualifications: (value: string) => void;
}

export const JobRequirements = ({
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
  requiredSkills,
  setRequiredSkills,
  minimumExperience,
  setMinimumExperience,
  preferredQualifications,
  setPreferredQualifications,
}: JobRequirementsProps) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 space-y-8 transition-all hover:shadow-xl hover:border-gray-200">
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Job Title*
            </Label>
            <Input
              id="jobTitle"
              placeholder="Enter job title..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full transition-all border-gray-200 focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobDescription" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Job Description*
            </Label>
            <Textarea
              id="jobDescription"
              placeholder="Enter detailed job description..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[120px] transition-all border-gray-200 focus:border-primary focus:ring-primary resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="requiredSkills" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-500" />
              Required Skills*
            </Label>
            <Textarea
              id="requiredSkills"
              placeholder="Enter required skills (e.g., Python, React, SQL)..."
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              className="min-h-[100px] transition-all border-gray-200 focus:border-primary focus:ring-primary resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumExperience" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Minimum Experience (years)*
            </Label>
            <Input
              id="minimumExperience"
              type="number"
              placeholder="Enter minimum years of experience..."
              value={minimumExperience}
              onChange={(e) => setMinimumExperience(e.target.value)}
              className="w-full transition-all border-gray-200 focus:border-primary focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredQualifications" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-gray-500" />
              Preferred Qualifications
            </Label>
            <Textarea
              id="preferredQualifications"
              placeholder="Enter preferred qualifications..."
              value={preferredQualifications}
              onChange={(e) => setPreferredQualifications(e.target.value)}
              className="min-h-[100px] transition-all border-gray-200 focus:border-primary focus:ring-primary resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};