import { FileWithPreview } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, X, Check, Loader2 } from "lucide-react";
import { formatFileSize } from "@/utils/fileUtils";

interface FileItemProps {
  file: FileWithPreview;
  onRemove: (file: FileWithPreview) => void;
  processed?: boolean;
  uploading?: boolean;
  uploaded?: boolean;
}

const FileItem = ({ 
  file, 
  onRemove,
  processed = false,
  uploading = false,
  uploaded = false
}: FileItemProps) => {
  if (!file) {
    return null;
  }

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
    processed: processed,
    uploading: uploading,
    uploaded: uploaded
  };
  
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-3 flex-1">
        <FileText className="h-8 w-8 text-blue-500" />
        <div className="flex-1 space-y-2">
          <p className="font-medium truncate">{safeFile.name}</p>
          <div>
            <p className="text-sm text-gray-500">
              {formatFileSize(safeFile.size)}
            </p>
            {/* Only show progress bar for unprocessed files */}
            {!processed && safeFile.progress !== undefined && safeFile.progress < 100 && (
              <Progress value={safeFile.progress} className="mt-2" />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {uploading && (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        )}
        {uploaded && (
          <Check className="h-5 w-5 text-green-500" />
        )}
        {!uploading && !uploaded && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileItem;