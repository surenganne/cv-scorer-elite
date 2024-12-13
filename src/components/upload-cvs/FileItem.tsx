import { FileWithPreview } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, X, Check, Loader2 } from "lucide-react";
import { formatFileSize } from "@/utils/fileUtils";

interface FileItemProps {
  file: FileWithPreview;
  onRemove: (file: FileWithPreview) => void;
  onUpload?: (file: FileWithPreview) => Promise<void>;
  buttonText?: string;
  processed?: boolean;
}

const FileItem = ({ 
  file, 
  onRemove, 
  onUpload, 
  buttonText = "Upload", 
  processed = false 
}: FileItemProps) => {
  if (!file) {
    return null;
  }
  
  const handleUpload = async () => {
    if (onUpload) {
      await onUpload(file);
    }
  };

  const handleRemove = () => {
    onRemove(file);
  };

  // Create a safe file object with only the properties we need
  const fileInfo = {
    name: file.name,
    size: file.size,
    progress: file.progress,
    type: file.type,
    preview: file.preview
  };
  
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-3 flex-1">
        <FileText className="h-8 w-8 text-blue-500" />
        <div className="flex-1 space-y-2">
          <p className="font-medium truncate">{fileInfo.name}</p>
          <p className="text-sm text-gray-500">
            {formatFileSize(fileInfo.size)}
          </p>
          {fileInfo.progress !== undefined && fileInfo.progress < 100 && (
            <div className="w-full">
              <Progress value={fileInfo.progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">{Math.round(fileInfo.progress)}% processed</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        {processed ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : fileInfo.progress === 100 ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : fileInfo.progress !== undefined ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        ) : onUpload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpload}
          >
            {buttonText}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default FileItem;