import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JobRequirements } from "@/components/scoring/JobRequirements";
import { ScoringWeights } from "@/components/scoring/ScoringWeights";
import { SaveJobButton } from "@/components/scoring/SaveJobButton";
import { JobStatusToggle } from "@/components/scoring/JobStatusToggle";
import Navbar from "@/components/layout/Navbar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobForm } from "@/hooks/useJobForm";

const ConfigureScoring = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const {
    formState,
    setters,
    handlers,
    existingJob,
  } = useJobForm(id);

  useEffect(() => {
    if (existingJob) {
      setters.setJobTitle(existingJob.title);
      setters.setJobDescription(existingJob.description);
      setters.setRequiredSkills(existingJob.required_skills);
      setters.setMinimumExperience(existingJob.minimum_experience);
      setters.setPreferredQualifications(existingJob.preferred_qualifications || "");
      setters.setExperienceWeight(existingJob.experience_weight);
      setters.setSkillsWeight(existingJob.skills_weight);
      setters.setEducationWeight(existingJob.education_weight);
      setters.setCertificationsWeight(existingJob.certifications_weight);
      setters.setIsActive(existingJob.status === 'active');
    }
  }, [existingJob, setters]);

  const handleSave = async () => {
    if (!handlers.validateForm()) return;
    
    setters.setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading
      navigate("/manage-jds");
    } finally {
      setters.setIsSaving(false);
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

          <JobStatusToggle 
            isActive={formState.isActive} 
            onToggle={setters.setIsActive} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JobRequirements
              jobTitle={formState.jobTitle}
              setJobTitle={setters.setJobTitle}
              jobDescription={formState.jobDescription}
              setJobDescription={setters.setJobDescription}
              requiredSkills={formState.requiredSkills}
              setRequiredSkills={setters.setRequiredSkills}
              minimumExperience={formState.minimumExperience}
              setMinimumExperience={setters.setMinimumExperience}
              preferredQualifications={formState.preferredQualifications}
              setPreferredQualifications={setters.setPreferredQualifications}
            />

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6 transition-all hover:shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900">Scoring Weights</h2>
              <p className="text-gray-500">
                Adjust the importance of each criterion in the candidate evaluation process.
              </p>
              <ScoringWeights
                experienceWeight={formState.experienceWeight}
                skillsWeight={formState.skillsWeight}
                educationWeight={formState.educationWeight}
                certificationsWeight={formState.certificationsWeight}
                onWeightChange={handlers.handleWeightChange}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <SaveJobButton
              id={id}
              jobData={handlers.getFormData()}
              isLoading={formState.isSaving}
              onSuccess={handleSave}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfigureScoring;