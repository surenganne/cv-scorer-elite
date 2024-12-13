import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";
import { extractFilesFromZip } from "@/utils/zipUtils";

export const useFileProcessor = () => {
  const { toast } = useToast();

  const uploadToStorageAndDB = async (file: FileWithPreview) => {
    try {
      // Create a unique filename while preserving the original extension
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const extension = file.file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `${timestamp}-${randomString}.${extension}`;

      // Start both uploads in parallel
      const [storageUpload, dbUpload] = await Promise.all([
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
        ...file,
        webkitRelativePath: fileName,
        publicUrl: storageUpload.publicUrl
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const processFile = async (file: FileWithPreview, updateProgress: (progress: number) => void) => {
    try {
      updateProgress(0);
      console.log('Starting processing for:', file.file.name, 'Size:', file.file.size, 'bytes');
      
      if (file.file.type === 'application/zip' || file.file.type === 'application/x-zip-compressed') {
        // Handle ZIP files
        updateProgress(10);
        const extractedFiles = await extractFilesFromZip(file.file);
        console.log(`Successfully extracted ${extractedFiles.length} files from ZIP`);
        updateProgress(20);

        const processedFiles: FileWithPreview[] = [];
        let processedCount = 0;
        const totalFiles = extractedFiles.length;
        
        for (const extractedFile of extractedFiles) {
          try {
            const currentProgress = 20 + Math.round((processedCount / totalFiles) * 80);
            updateProgress(currentProgress);

            // Process the file without uploading
            const formData = new FormData();
            formData.append('file', extractedFile.file);
            
            const { data, error } = await supabase.functions.invoke('process-cv', {
              body: formData,
            });

            if (error) {
              console.error('Processing error:', error);
              continue;
            }

            processedFiles.push({
              ...extractedFile,
              file: extractedFile.file,
              preview: extractedFile.preview
            });

            processedCount++;
          } catch (error) {
            console.error('Error processing file:', error);
            continue;
          }
        }

        updateProgress(100);
        
        if (processedFiles.length === 0) {
          toast({
            title: "Processing Failed",
            description: "Failed to process any files from the ZIP.",
            variant: "destructive",
          });
          return [];
        }

        toast({
          title: "Processing Complete",
          description: `Successfully processed ${processedFiles.length} files.`,
        });

        return processedFiles;
      } else {
        // Handle individual files
        try {
          updateProgress(20);

          // Process the file without uploading
          const formData = new FormData();
          formData.append('file', file.file);
          
          const { data, error } = await supabase.functions.invoke('process-cv', {
            body: formData,
          });

          if (error) throw error;

          updateProgress(100);
          
          const processedFile: FileWithPreview = {
            ...file,
            file: file.file,
            preview: file.preview
          };

          toast({
            title: "Processing Complete",
            description: `Successfully processed ${file.file.name}.`,
          });

          return [processedFile];
        } catch (error) {
          console.error('Processing error:', error);
          toast({
            title: "Processing Failed",
            description: `Failed to process ${file.file.name}. Please try again.`,
            variant: "destructive",
          });
          throw error;
        }
      }
    } catch (error) {
      console.error('File processing error:', error);
      updateProgress(0);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing the file.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadFiles = async (files: FileWithPreview[]) => {
    try {
      const uploadPromises = files.map(file => uploadToStorageAndDB(file));
      const uploadedFiles = await Promise.all(uploadPromises);

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedFiles.length} files.`,
      });

      return uploadedFiles;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { processFile, uploadFiles };
};