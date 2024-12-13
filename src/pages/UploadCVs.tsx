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

const UploadCVs = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const { toast } = useToast();

  const uploadFile = async (file: FileWithPreview) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (file.candidateName) {
        formData.append('candidateName', file.candidateName);
      }

      const response = await supabase.functions.invoke('upload-cv', {
        body: formData,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Upload Complete",
        description: file.type.includes('zip') 
          ? "ZIP file contents have been extracted and uploaded successfully."
          : `${file.name} has been uploaded successfully.`,
      });

      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => 
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        progress: 0,
        candidateName: '',
      })
    );
    
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const handleCandidateNameChange = (file: FileWithPreview, name: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((f) =>
        f === file ? { ...f, candidateName: name } : f
      )
    );
  };

  const handleUpload = async (file: FileWithPreview) => {
    try {
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: 0 } : f
        )
      );

      const progressInterval = setInterval(() => {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f === file && f.progress !== undefined && f.progress < 90
              ? { ...f, progress: f.progress + 10 }
              : f
          )
        );
      }, 200);

      await uploadFile(file);

      clearInterval(progressInterval);
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f === file ? { ...f, progress: 100 } : f
        )
      );
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
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
                    onUpload={handleUpload}
                    onCandidateNameChange={handleCandidateNameChange}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadCVs;