import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface FileUploadZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

const FileUploadZone = ({ onDrop }: FileUploadZoneProps) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-gray-300 hover:border-primary"
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
      <p className="text-lg font-medium">
        {isDragActive
          ? "Drop the files here..."
          : "Drag & drop files here, or click to select"}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Supported formats: PDF, DOC, DOCX, ZIP
      </p>
    </div>
  );
};

export default FileUploadZone;