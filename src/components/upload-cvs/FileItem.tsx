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

  // Extract primitive values directly to avoid method binding issues
  const fileName = file.name || '';
  const fileSize = typeof file.size === 'number' ? file.size : 0;
  const fileType = file.type || '';
  const fileProgress = typeof file.progress === 'number' ? file.progress : undefined;
  const filePreview = file.preview || '';
  
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-3 flex-1">
        <FileText className="h-8 w-8 text-blue-500" />
        <div className="flex-1 space-y-2">
          <p className="font-medium truncate">{fileName}</p>
          <p className="text-sm text-gray-500">
            {formatFileSize(fileSize)}
          </p>
          {fileProgress !== undefined && fileProgress < 100 && (
            <div className="w-full">
              <Progress value={fileProgress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">{Math.round(fileProgress)}% processed</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        {processed ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : fileProgress === 100 ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : fileProgress !== undefined ? (
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