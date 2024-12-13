import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";

interface JobDescriptionJSONProps {
  jobData: {
    id: string;
    title: string;
    description: string;
    required_skills: string;
    minimum_experience: number;
    preferred_qualifications?: string;
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
    created_at?: string;
    updated_at?: string;
    status: string;
  };
}

export const JobDescriptionJSON = ({ jobData }: JobDescriptionJSONProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateJSON = () => {
    setIsGenerating(true);
    try {
      // Create a formatted JSON object
      const jsonData = {
        jobDescription: {
          id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          requirements: {
            requiredSkills: jobData.required_skills.split(',').map(skill => skill.trim()),
            minimumExperience: jobData.minimum_experience,
            preferredQualifications: jobData.preferred_qualifications
              ? jobData.preferred_qualifications.split(',').map(qual => qual.trim())
              : []
          },
          weights: {
            experience: jobData.experience_weight,
            skills: jobData.skills_weight,
            education: jobData.education_weight,
            certifications: jobData.certifications_weight
          },
          metadata: {
            status: jobData.status,
            createdAt: jobData.created_at,
            updatedAt: jobData.updated_at
          }
        }
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `job-description-${jobData.id}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "JSON Generated",
        description: "Job description JSON has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating JSON:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate JSON file. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerateJSON}
      disabled={isGenerating}
      className="ml-2"
    >
      <Download className="h-4 w-4 mr-2" />
      Export JSON
    </Button>
  );
};