import { ScoringWeights } from "@/components/scoring/ScoringWeights";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ConfigureScoring = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [experienceWeight, setExperienceWeight] = useState(25);
  const [skillsWeight, setSkillsWeight] = useState(25);
  const [educationWeight, setEducationWeight] = useState(25);
  const [certificationsWeight, setCertificationsWeight] = useState(25);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [minimumExperience, setMinimumExperience] = useState("");
  const [preferredQualifications, setPreferredQualifications] = useState("");

  const handleWeightChange = (type: string, value: number) => {
    switch (type) {
      case "experience":
        setExperienceWeight(value);
        break;
      case "skills":
        setSkillsWeight(value);
        break;
      case "education":
        setEducationWeight(value);
        break;
      case "certifications":
        setCertificationsWeight(value);
        break;
    }
  };

  const saveJobMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("job_descriptions").insert([
        {
          title: jobTitle,
          description: jobDescription,
          required_skills: requiredSkills,
          minimum_experience: parseInt(minimumExperience),
          preferred_qualifications: preferredQualifications,
          experience_weight: experienceWeight,
          skills_weight: skillsWeight,
          education_weight: educationWeight,
          certifications_weight: certificationsWeight,
        },
      ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job description and scoring configuration have been saved successfully.",
      });
      // Reset form
      setJobTitle("");
      setJobDescription("");
      setRequiredSkills("");
      setMinimumExperience("");
      setPreferredQualifications("");
      setExperienceWeight(25);
      setSkillsWeight(25);
      setEducationWeight(25);
      setCertificationsWeight(25);
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["jobDescriptions"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save job description. Please try again.",
      });
      console.error("Error saving job description:", error);
    },
  });

  const handleSave = () => {
    if (!jobTitle || !jobDescription || !requiredSkills || !minimumExperience) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return;
    }
    saveJobMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Job Requirements</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="jobTitle">Job Title*</Label>
                <Input
                  id="jobTitle"
                  placeholder="Enter job title..."
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="jobDescription">Job Description*</Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Enter detailed job description..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="requiredSkills">Required Skills*</Label>
                <Textarea
                  id="requiredSkills"
                  placeholder="Enter required skills (e.g., Python, React, SQL)..."
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="minimumExperience">Minimum Experience (years)*</Label>
                <Input
                  id="minimumExperience"
                  type="number"
                  placeholder="Enter minimum years of experience..."
                  value={minimumExperience}
                  onChange={(e) => setMinimumExperience(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="preferredQualifications">Preferred Qualifications</Label>
                <Textarea
                  id="preferredQualifications"
                  placeholder="Enter preferred qualifications..."
                  value={preferredQualifications}
                  onChange={(e) => setPreferredQualifications(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Scoring Weights</h2>
            <ScoringWeights
              experienceWeight={experienceWeight}
              skillsWeight={skillsWeight}
              educationWeight={educationWeight}
              certificationsWeight={certificationsWeight}
              onWeightChange={handleWeightChange}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleSave} 
              size="lg"
              disabled={saveJobMutation.isPending}
            >
              {saveJobMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfigureScoring;