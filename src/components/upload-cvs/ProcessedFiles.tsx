import { useState } from "react";
import { FileWithPreview } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Upload } from "lucide-react";
import FileItem from "./FileItem";

interface ProcessedFilesProps {
  files: FileWithPreview[];
  onRemove: (file: FileWithPreview) => void;
  onUploadToDatabase: () => Promise<void>;
}

const ProcessedFiles = ({ files, onRemove, onUploadToDatabase }: ProcessedFilesProps) => {
  const [showFiles, setShowFiles] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());

  if (files.length === 0) return null;

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      await onUploadToDatabase();
      // Mark all files as uploaded
      setUploadedFiles(new Set(files.map(file => file.file.name)));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Processed Files ({files.length})</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFiles(!showFiles)}
              className="flex items-center gap-2"
            >
              {showFiles ? (
                <>
                  Hide Files <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show Files <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || uploadedFiles.size === files.length}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading 
              ? "Uploading..." 
              : uploadedFiles.size === files.length 
                ? "Uploaded" 
                : `Upload ${files.length} Files to Database`
            }
          </Button>
        </div>
      </CardHeader>
      {showFiles && (
        <CardContent>
          <div className="space-y-4">
            {files.map((file, index) => (
              <FileItem
                key={index}
                file={file}
                onRemove={onRemove}
                processed={true}
                uploading={isUploading}
                uploaded={uploadedFiles.has(file.file.name)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProcessedFiles;