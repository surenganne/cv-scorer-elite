import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

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
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6 transition-all hover:shadow-md">
      <div className="space-y-2">
        <Label htmlFor="jobTitle" className="text-base font-semibold">Job Title*</Label>
        <Input
          id="jobTitle"
          placeholder="Enter job title..."
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobDescription" className="text-base font-semibold">Job Description*</Label>
        <Textarea
          id="jobDescription"
          placeholder="Enter detailed job description..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[120px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="requiredSkills" className="text-base font-semibold">Required Skills*</Label>
        <Textarea
          id="requiredSkills"
          placeholder="Enter required skills (e.g., Python, React, SQL)..."
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimumExperience" className="text-base font-semibold">Minimum Experience (years)*</Label>
        <Input
          id="minimumExperience"
          type="number"
          placeholder="Enter minimum years of experience..."
          value={minimumExperience}
          onChange={(e) => setMinimumExperience(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredQualifications" className="text-base font-semibold">Preferred Qualifications</Label>
        <Textarea
          id="preferredQualifications"
          placeholder="Enter preferred qualifications..."
          value={preferredQualifications}
          onChange={(e) => setPreferredQualifications(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};