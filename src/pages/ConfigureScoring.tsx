import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { JobRequirements } from "@/components/scoring/JobRequirements";
import { ScoringWeights } from "@/components/scoring/ScoringWeights";
import { SaveJobButton } from "@/components/scoring/SaveJobButton";
import { JobStatusToggle } from "@/components/scoring/JobStatusToggle";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConfigureScoring = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  // State management
  const [experienceWeight, setExperienceWeight] = useState(25);
  const [skillsWeight, setSkillsWeight] = useState(25);
  const [educationWeight, setEducationWeight] = useState(25);
  const [certificationsWeight, setCertificationsWeight] = useState(25);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [minimumExperience, setMinimumExperience] = useState("");
  const [preferredQualifications, setPreferredQualifications] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
      setIsActive(existingJob.status === 'active');
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

  const validateForm = () => {
    if (!jobTitle || !jobDescription || !requiredSkills || !minimumExperience) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
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
      status: isActive ? 'active' : 'inactive',
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      queryClient.invalidateQueries({ queryKey: ["jobDescriptions"] });
      navigate("/manage-jds");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {id ? "Edit Job Description" : "Create New Job Description"}
              </h1>
              <p className="text-gray-500">
                Configure the job requirements and scoring weights for candidate evaluation.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/manage-jds")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Job Descriptions
            </Button>
          </div>

          <JobStatusToggle isActive={isActive} onToggle={setIsActive} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JobRequirements
              jobTitle={jobTitle}
              setJobTitle={setJobTitle}
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              requiredSkills={requiredSkills}
              setRequiredSkills={setRequiredSkills}
              minimumExperience={minimumExperience}
              setMinimumExperience={setMinimumExperience}
              preferredQualifications={preferredQualifications}
              setPreferredQualifications={setPreferredQualifications}
            />

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6 transition-all hover:shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900">Scoring Weights</h2>
              <p className="text-gray-500">
                Adjust the importance of each criterion in the candidate evaluation process.
              </p>
              <ScoringWeights
                experienceWeight={experienceWeight}
                skillsWeight={skillsWeight}
                educationWeight={educationWeight}
                certificationsWeight={certificationsWeight}
                onWeightChange={handleWeightChange}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <SaveJobButton
              id={id}
              jobData={{
                title: jobTitle,
                description: jobDescription,
                required_skills: requiredSkills,
                minimum_experience: minimumExperience,
                preferred_qualifications: preferredQualifications,
                experience_weight: experienceWeight,
                skills_weight: skillsWeight,
                education_weight: educationWeight,
                certifications_weight: certificationsWeight,
                status: isActive ? 'active' : 'inactive',
              }}
              isLoading={isSaving}
              onSuccess={handleSave}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfigureScoring;