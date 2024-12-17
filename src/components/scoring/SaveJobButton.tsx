import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SaveJobButtonProps {
  id?: string;
  jobData: {
    title: string;
    description: string;
    required_skills: string;
    minimum_experience: string;
    preferred_qualifications: string;
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
    status: 'active' | 'inactive';
  };
  isLoading: boolean;
  onSuccess: () => void;
}

export const SaveJobButton = ({ id, jobData, isLoading, onSuccess }: SaveJobButtonProps) => {
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      if (id) {
        const { error } = await supabase
          .from("job_descriptions")
          .update(jobData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data: jobResponse, error: jobError } = await supabase
          .from("job_descriptions")
          .insert([jobData])
          .select()
          .single();
        
        if (jobError) throw jobError;

        // Call the resume ranking function with the new job ID
        const { error: rankingError } = await supabase.functions.invoke('rank-resumes', {
          body: {
            ...jobData,
            job_id: jobResponse.id
          }
        });

        if (rankingError) {
          console.error('Error ranking resumes:', rankingError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Job description saved but resume ranking failed. Please try ranking manually.",
          });
        }
      }

      toast({
        title: "Success",
        description: `Job description ${id ? "updated" : "saved"} successfully.`,
      });
      onSuccess();
    } catch (error) {
      console.error("Error saving job description:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${id ? "update" : "save"} job description.`,
      });
    }
  };

  return (
    <Button 
      onClick={handleSave}
      size="lg"
      className="px-8"
      disabled={isLoading}
    >
      {isLoading 
        ? "Saving..." 
        : id ? "Update Job Description" : "Save Job Description"
      }
    </Button>
  );
};