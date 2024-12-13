import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import FileUploadZone from "@/components/upload-cvs/FileUploadZone";
import SelectedFiles from "@/components/upload-cvs/SelectedFiles";
import ProcessedFiles from "@/components/upload-cvs/ProcessedFiles";
import Navbar from "@/components/layout/Navbar";
import { useFileProcessing } from "@/hooks/useFileProcessing";

const UploadCVs = () => {
  const {
    files,
    setFiles,
    processedFiles,
    removeFile,
    handleProcess,
    uploadToDatabase
  } = useFileProcessing();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => 
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        progress: undefined
      })
    );
    
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, [setFiles]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 space-y-6">
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