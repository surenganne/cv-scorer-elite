import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileWithPreview } from "@/types/file";
import FileUploadZone from "@/components/upload-cvs/FileUploadZone";
import FileItem from "@/components/upload-cvs/FileItem";
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
      const response = await supabase.functions.invoke('process-cv', {
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.error) {
        console.error('Processing error:', response.error);
        throw new Error(response.error.message);
      }

      console.log('Processing completed:', response.data);

      // Set final progress and show success message
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: 100 } : f
        )
      );

      // Add to processed files
      setProcessedFiles(prev => [...prev, { ...file, processed: true }]);

      toast({
        title: "Processing Complete",
        description: `${file.name} has been processed successfully.`,
      });

      return response.data;
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

        const response = await supabase.functions.invoke('upload-cv', {
          body: formData,
        });

        if (response.error) throw new Error(response.error.message);
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
          <Card>
            <CardHeader>
              <CardTitle>Selected Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((file, index) => (
                  <FileItem
                    key={index}
                    file={file}
                    onRemove={removeFile}
                    onUpload={handleProcess}
                    buttonText="Process"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {processedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Processed Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedFiles.map((file, index) => (
                  <FileItem
                    key={index}
                    file={file}
                    onRemove={removeFile}
                    processed={true}
                  />
                ))}
                <div className="flex justify-end mt-4">
                  <Button onClick={uploadToDatabase}>
                    Upload All to Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadCVs;