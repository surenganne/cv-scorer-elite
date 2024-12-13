import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";
import FileUploadZone from "@/components/upload-cvs/FileUploadZone";
import SelectedFiles from "@/components/upload-cvs/SelectedFiles";
import ProcessedFiles from "@/components/upload-cvs/ProcessedFiles";
import Navbar from "@/components/layout/Navbar";

const UploadCVs = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileWithPreview[]>([]);
  const { toast } = useToast();

  const processFile = async (file: FileWithPreview) => {
    try {
      // Start with initial progress
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: 0 } : f
        )
      );

      const formData = new FormData();
      formData.append('file', file);

      // Create a progress interval that updates more frequently for better feedback
      const progressInterval = setInterval(() => {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f === file && f.progress !== undefined && f.progress < 90
              ? { ...f, progress: f.progress + 5 }
              : f
          )
        );
      }, 300);

      console.log('Starting processing for:', file.name);
      const { data, error } = await supabase.functions.invoke('process-cv', {
        body: formData,
      });

      clearInterval(progressInterval);

      if (error) {
        console.error('Processing error:', error);
        throw error;
      }

      console.log('Processing completed:', data);

      // Set final progress and show success message
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: 100 } : f
        )
      );

      // Handle both single file and ZIP file responses
      if (data.isZip) {
        // For ZIP files, add all processed files
        const processedZipFiles = data.processedFiles.map((result: any) => ({
          ...file,
          name: result.fileName,
          processed: true,
          score: result.score,
          matchPercentage: result.matchPercentage,
        }));
        setProcessedFiles(prev => [...prev, ...processedZipFiles]);
      } else {
        // For single files
        setProcessedFiles(prev => [...prev, { ...file, processed: true }]);
      }

      toast({
        title: "Processing Complete",
        description: `${file.name} has been processed successfully.`,
      });

      return data;
    } catch (error) {
      console.error('Processing error:', error);
      // Reset progress on error
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: undefined } : f
        )
      );
      
      toast({
        title: "Processing Failed",
        description: `Failed to process ${file.name}. Please try again.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadToDatabase = async () => {
    try {
      for (const file of processedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const { error } = await supabase.functions.invoke('upload-cv', {
          body: formData,
        });

        if (error) throw error;
      }

      toast({
        title: "Upload Complete",
        description: "All files have been uploaded to the database successfully.",
      });

      // Clear both files and processed files after successful upload
      setFiles([]);
      setProcessedFiles([]);
    } catch (error) {
      console.error('Upload to database failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files to database. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => 
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        progress: undefined
      })
    );
    
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    setProcessedFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const handleProcess = async (file: FileWithPreview) => {
    try {
      await processFile(file);
    } catch (error) {
      console.error('Processing failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Upload CVs</h1>
          <Link to="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadZone onDrop={onDrop} />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <SelectedFiles
            files={files}
            onRemove={removeFile}
            onProcess={handleProcess}
          />
        )}

        {processedFiles.length > 0 && (
          <ProcessedFiles
            files={processedFiles}
            onRemove={removeFile}
            onUploadToDatabase={uploadToDatabase}
          />
        )}
      </div>
    </div>
  );
};

export default UploadCVs;