import { useState } from "react";
import { FileWithPreview } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import FileItem from "./FileItem";

interface ProcessedFilesProps {
  files: FileWithPreview[];
  onRemove: (file: FileWithPreview) => void;
  onUploadToDatabase: () => Promise<void>;
}

const ProcessedFiles = ({ files, onRemove, onUploadToDatabase }: ProcessedFilesProps) => {
  const [showFiles, setShowFiles] = useState(false);

  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
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
      </CardHeader>
      <CardContent>
        {showFiles && (
          <div className="space-y-4">
            {files.map((file, index) => (
              <FileItem
                key={index}
                file={file}
                onRemove={onRemove}
                processed={true}
              />
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <Button onClick={onUploadToDatabase}>
            Upload All to Database
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessedFiles;