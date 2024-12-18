import { supabase } from "@/integrations/supabase/client";

export const triggerBatchJob = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('trigger-batch-job');
    
    if (error) {
      console.error('Error triggering batch job:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error triggering batch job:', error);
    throw error;
  }
};

export const checkJobStatus = async (jobId: string) => {
  try {
    const response = await fetch('https://q6iagsh8w1.execute-api.ap-south-2.amazonaws.com/dev/checkJobStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ job_id: jobId }),
    });

    if (!response.ok) {
      throw new Error('Failed to check job status');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking job status:', error);
    throw error;
  }
};