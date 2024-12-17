import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";
import { useToast } from "./use-toast";
import { triggerBatchJob } from "@/utils/batchJobApi";

export const useFileUpload = () => {
  const { toast } = useToast();

  const uploadToStorageAndDB = async (file: FileWithPreview) => {
    try {
      // Create a unique filename while preserving the original extension
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${timestamp}-${randomString}.${extension}`;

      // Start both uploads in parallel
      const [storageResult, dbResult] = await Promise.all([
        // Upload to storage
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

        // Upload to database
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

  const uploadFiles = async (files: FileWithPreview[]) => {
    try {
      const uploadPromises = files.map(file => uploadToStorageAndDB(file));
      const uploadedFiles = await Promise.all(uploadPromises);

      // After successful upload, trigger the batch job
      await triggerBatchJob();

      toast({
        title: "Upload Complete",
        description: "Files uploaded and batch processing initiated.",
      });

      return uploadedFiles;
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { uploadFiles };
};