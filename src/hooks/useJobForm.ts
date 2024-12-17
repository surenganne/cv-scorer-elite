import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useJobForm = (id?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [experienceWeight, setExperienceWeight] = useState(25);
  const [skillsWeight, setSkillsWeight] = useState(25);
  const [educationWeight, setEducationWeight] = useState(25);
  const [certificationsWeight, setCertificationsWeight] = useState(25);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [minimumExperience, setMinimumExperience] = useState<number>(0);
  const [preferredQualifications, setPreferredQualifications] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!jobTitle || !jobDescription || !requiredSkills || minimumExperience === undefined) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      });
      return false;
    }
    return true;
  };

  const getFormData = () => ({
    title: jobTitle,
    description: jobDescription,
    required_skills: requiredSkills,
    minimum_experience: minimumExperience,
    preferred_qualifications: preferredQualifications,
    experience_weight: experienceWeight,
    skills_weight: skillsWeight,
    education_weight: educationWeight,
    certifications_weight: certificationsWeight,
    status: isActive ? 'active' as const : 'inactive' as const,
  });

  return {
    formState: {
      experienceWeight,
      skillsWeight,
      educationWeight,
      certificationsWeight,
      jobTitle,
      jobDescription,
      requiredSkills,
      minimumExperience,
      preferredQualifications,
      isActive,
      isSaving,
    },
    setters: {
      setExperienceWeight,
      setSkillsWeight,
      setEducationWeight,
      setCertificationsWeight,
      setJobTitle,
      setJobDescription,
      setRequiredSkills,
      setMinimumExperience,
      setPreferredQualifications,
      setIsActive,
      setIsSaving,
    },
    handlers: {
      handleWeightChange,
      validateForm,
      getFormData,
    },
    existingJob,
  };
};