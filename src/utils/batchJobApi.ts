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