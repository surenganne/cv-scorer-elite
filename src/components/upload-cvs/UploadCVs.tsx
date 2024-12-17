import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FileWithPreview } from "@/types/file";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { useToast } from "@/hooks/use-toast";
import FileItem from "./FileItem";
import { Upload } from "lucide-react";

const UploadCVs = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [processedFiles, setProcessedFiles] = useState<FileWithPreview[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const { processFile, uploadFiles } = useFileProcessor();
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    }
  });

  const removeSelectedFile = (fileToRemove: FileWithPreview) => {
    setSelectedFiles((prev) =>
      prev.filter((file) => file.file.name !== fileToRemove.file.name)
    );
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const removeProcessedFile = (fileToRemove: FileWithPreview) => {
    setProcessedFiles((prev) =>
      prev.filter((file) => file.file.name !== fileToRemove.file.name)
    );
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const processSelectedFiles = async () => {
    try {
      const processPromises = selectedFiles.map(async (file) => {
        try {
          const processed = await processFile(file, (progress) => {
            setSelectedFiles((prev) =>
              prev.map((f) =>
                f.file.name === file.file.name ? { ...f, progress } : f
              )
            );
          });
          return processed[0];
        } catch (error) {
          console.error(`Error processing file ${file.file.name}:`, error);
          return null;
        }
      });

      const processed = (await Promise.all(processPromises)).filter(
        (file): file is FileWithPreview => file !== null
      );

      setProcessedFiles((prev) => [...prev, ...processed]);
      setSelectedFiles([]);

      toast({
        title: "Files Processed",
        description: `Successfully processed ${processed.length} files.`,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      toast({
        title: "Processing Error",
        description: "An error occurred while processing files.",
        variant: "destructive",
      });
    }
  };

  const uploadProcessedFiles = async () => {
    try {
      // Mark all files as uploading
      const newUploadingFiles = new Set(processedFiles.map(file => file.file.name));
      setUploadingFiles(newUploadingFiles);

      // Upload all files
      await uploadFiles(processedFiles);

      // Mark all files as uploaded
      const newUploadedFiles = new Set(processedFiles.map(file => file.file.name));
      setUploadedFiles(newUploadedFiles);
      setUploadingFiles(new Set());

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${processedFiles.length} files to database.`,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadingFiles(new Set());
      toast({
        title: "Upload Error",
        description: "An error occurred while uploading files to database.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <Upload className="h-12 w-12 mx-auto text-gray-400" />
          <div>
            <p className="text-lg font-medium">
              {isDragActive
                ? "Drop the files here..."
                : "Drag and drop files here, or click to select"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports PDF, DOC, DOCX, and ZIP files
            </p>
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Selected Files</h3>
            <Button onClick={processSelectedFiles}>
              Process {selectedFiles.length} Files
            </Button>
          </div>
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <FileItem
                key={file.file.name}
                file={file}
                onRemove={removeSelectedFile}
              />
            ))}
          </div>
        </div>
      )}

      {processedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Processed Files</h3>
            <Button onClick={uploadProcessedFiles}>
              Upload {processedFiles.length} Files to Database
            </Button>
          </div>
          <div className="space-y-2">
            {processedFiles.map((file) => (
              <FileItem
                key={file.file.name}
                file={file}
                onRemove={removeProcessedFile}
                processed={true}
                uploading={uploadingFiles.has(file.file.name)}
                uploaded={uploadedFiles.has(file.file.name)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadCVs;