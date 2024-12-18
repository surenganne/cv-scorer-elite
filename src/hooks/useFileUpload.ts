import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";
import { useToast } from "./use-toast";
import { triggerBatchJob, checkJobStatus } from "@/utils/batchJobApi";

export const useFileUpload = () => {
  const { toast } = useToast();

  const uploadToStorageAndDB = async (file: FileWithPreview) => {
    try {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${timestamp}-${randomString}.${extension}`;

      const [storageResult, dbResult] = await Promise.all([
        (async () => {
          const fileBlob = new Blob([await file.file.arrayBuffer()], { 
            type: file.file.type || 'application/octet-stream'
          });

          console.log('Uploading file to storage:', fileName, 'Size:', fileBlob.size, 'Type:', fileBlob.type);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('cvs')
            .upload(fileName, fileBlob, {
              contentType: fileBlob.type,
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = await supabase.storage
            .from('cvs')
            .getPublicUrl(fileName);

          return { fileName, publicUrl: urlData?.publicUrl };
        })(),

        (async () => {
          const fileData = {
            file_name: file.file.name,
            file_path: fileName,
            content_type: file.file.type || 'application/octet-stream',
            file_size: file.file.size,
            upload_date: new Date().toISOString()
          };

          console.log('Uploading file to database:', fileData);

          const { error: dbError } = await supabase
            .from('cv_uploads')
            .insert([fileData]);

          if (dbError) throw dbError;

          return fileData;
        })()
      ]);

      return {
        fileName: storageResult.fileName,
        publicUrl: storageResult.publicUrl,
        dbRecord: dbResult
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const pollJobStatus = async (jobId: string, retries = 0): Promise<boolean> => {
    try {
      if (retries > 10) { // Maximum 10 retries
        throw new Error('Max retries reached while checking job status');
      }

      const result = await checkJobStatus(jobId);
      
      if (result.status === 'SUCCEEDED') {
        return true;
      } else if (result.status === 'FAILED') {
        throw new Error(result.error || 'Batch job failed');
      }
      
      // Wait for 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
      return pollJobStatus(jobId, retries + 1);
    } catch (error) {
      console.error('Error polling job status:', error);
      throw error;
    }
  };

  const uploadFiles = async (files: FileWithPreview[]) => {
    try {
      const uploadPromises = files.map(file => uploadToStorageAndDB(file));
      const uploadedFiles = await Promise.all(uploadPromises);

      // Trigger the batch job and get the job ID
      const batchJobResult = await triggerBatchJob();
      
      toast({
        title: "Files Uploaded",
        description: "Processing files in batch job...",
      });

      try {
        // Poll for job status with retries
        await pollJobStatus(batchJobResult.jobId);

        toast({
          title: "Processing Complete",
          description: "Files have been processed successfully.",
        });
      } catch (error) {
        console.error('Job processing error:', error);
        toast({
          title: "Processing Warning",
          description: "Files were uploaded but processing may not be complete. Please check the results later.",
          variant: "destructive",
        });
      }

      return uploadedFiles;
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { uploadFiles };
};
