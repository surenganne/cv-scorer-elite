import { FileWithPreview } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, X, Check, Loader2 } from "lucide-react";

interface FileItemProps {
  file: FileWithPreview;
  onRemove: (file: FileWithPreview) => void;
  onUpload: (file: FileWithPreview) => void;
}

const FileItem = ({ file, onRemove, onUpload }: FileItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-3 flex-1">
        <FileText className="h-8 w-8 text-blue-500" />
        <div className="flex-1 space-y-2">
          <p className="font-medium truncate">{file.name}</p>
          <p className="text-sm text-gray-500">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          {file.progress !== undefined && file.progress < 100 && (
            <div className="w-full">
              <Progress value={file.progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">{file.progress}% uploaded</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        {file.progress === 100 ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : file.progress !== undefined ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpload(file)}
          >
            Upload
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(file)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default FileItem;