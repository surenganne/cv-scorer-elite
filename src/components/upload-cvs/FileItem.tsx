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

  // Create a safe copy of the file object with primitive values only
  const safeFile = {
    name: file.file.name,
    size: file.file.size,
    type: file.file.type,
    progress: file.progress,
    preview: file.preview,
    processed: file.processed,
  };
  
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-3 flex-1">
        <FileText className="h-8 w-8 text-blue-500" />
        <div className="flex-1 space-y-2">
          <p className="font-medium truncate">{safeFile.name}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{formatFileSize(safeFile.size)}</span>
            {safeFile.progress !== undefined && safeFile.progress < 100 && (
              <>
                <Progress value={safeFile.progress} className="flex-1" />
                <span className="text-sm text-gray-500">{Math.round(safeFile.progress)}%</span>
              </>
            )}
            {safeFile.processed && (
              <span className="text-sm text-green-500 flex items-center gap-1">
                <Check className="h-4 w-4" /> Processed
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        {processed ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : safeFile.progress === 100 ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : safeFile.progress !== undefined ? (
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