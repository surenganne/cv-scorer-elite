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
    console.log('Checking job status for:', jobId);
    
    const { data, error } = await supabase.functions.invoke('check-job-status', {
      body: { job_id: jobId }
    });

    if (error) {
      console.error('Error checking job status:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data received from job status check');
    }

    console.log('Job status response:', data);
    return data;
  } catch (error) {
    console.error('Error checking job status:', error);
    throw error;
  }
};