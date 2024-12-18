import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface SaveJobButtonProps {
  id?: string;
  jobData: {
    title: string;
    description: string;
    required_skills: string;
    minimum_experience: number;
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

export const SaveJobButton = ({ id, jobData, isLoading: externalLoading, onSuccess }: SaveJobButtonProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...jobData,
        minimum_experience: Number(jobData.minimum_experience),
      };

      let savedJobId = id;

      // Save to job_descriptions table
      if (id) {
        const { error } = await supabase
          .from("job_descriptions")
          .update(dataToSave)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data: jobResponse, error: jobError } = await supabase
          .from("job_descriptions")
          .insert([dataToSave])
          .select()
          .single();
        
        if (jobError) throw jobError;
        savedJobId = jobResponse.id;
      }

      // Call the resume ranking API
      const rankingResponse = await fetch('https://3ltge7zfy7j26bdyygdwlcrtse0rcixl.lambda-url.ap-south-1.on.aws/rank-resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dataToSave,
          job_id: savedJobId
        })
      });

      if (!rankingResponse.ok) {
        console.error('Error ranking resumes:', await rankingResponse.text());
        throw new Error('Resume ranking failed');
      }

      // Wait for the ranking data
      const rankingData = await rankingResponse.json();

      // Check if a ranking already exists for this job
      const { data: existingRanking } = await supabase
        .from('edb_cv_ranking')
        .select('id')
        .eq('job_id', savedJobId)
        .single();

      if (existingRanking) {
        // Update existing ranking
        const { error: updateError } = await supabase
          .from('edb_cv_ranking')
          .update({ ranked_resumes: rankingData })
          .eq('job_id', savedJobId);

        if (updateError) throw updateError;
      } else {
        // Insert new ranking
        const { error: insertError } = await supabase
          .from('edb_cv_ranking')
          .insert([{
            job_id: savedJobId,
            ranked_resumes: rankingData
          }]);

        if (insertError) throw insertError;
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
    } finally {
      setIsSaving(false);
    }
  };

  const isDisabled = isSaving || externalLoading;

  return (
    <Button 
      onClick={handleSave}
      size="lg"
      className="px-8"
      disabled={isDisabled}
    >
      {isDisabled ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {id ? "Updating..." : "Saving..."}
        </>
      ) : (
        id ? "Update Job Description" : "Save Job Description"
      )}
    </Button>
  );
};