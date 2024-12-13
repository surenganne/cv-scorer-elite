import { ScoringWeights } from "@/components/scoring/ScoringWeights";
import Navbar from "@/components/layout/Navbar";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const ConfigureScoring = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
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

  // Fetch existing job description if editing
  const { data: existingJob } = useQuery({
    queryKey: ["jobDescription", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("job_descriptions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Update form with existing data when editing
  useEffect(() => {
    if (existingJob) {
      setJobTitle(existingJob.title);
      setJobDescription(existingJob.description);
      setRequiredSkills(existingJob.required_skills);
      setMinimumExperience(existingJob.minimum_experience.toString());
      setPreferredQualifications(existingJob.preferred_qualifications || "");
      setExperienceWeight(existingJob.experience_weight);
      setSkillsWeight(existingJob.skills_weight);
      setEducationWeight(existingJob.education_weight);
      setCertificationsWeight(existingJob.certifications_weight);
    }
  }, [existingJob]);

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
      const jobData = {
        title: jobTitle,
        description: jobDescription,
        required_skills: requiredSkills,
        minimum_experience: parseInt(minimumExperience),
        preferred_qualifications: preferredQualifications,
        experience_weight: experienceWeight,
        skills_weight: skillsWeight,
        education_weight: educationWeight,
        certifications_weight: certificationsWeight,
      };

      if (id) {
        const { data, error } = await supabase
          .from("job_descriptions")
          .update(jobData)
          .eq("id", id);
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("job_descriptions")
          .insert([jobData]);
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Job description ${id ? "updated" : "saved"} successfully.`,
      });
      // Reset form and redirect
      navigate("/manage-jds");
      queryClient.invalidateQueries({ queryKey: ["jobDescriptions"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${id ? "update" : "save"} job description.`,
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? "Edit Job Description" : "Create New Job Description"}
          </h1>
          <Button variant="outline" onClick={() => navigate("/manage-jds")}>
            Back to Job Descriptions
          </Button>
        </div>
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
              {saveJobMutation.isPending ? "Saving..." : id ? "Update Job Description" : "Save Job Description"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfigureScoring;