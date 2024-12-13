import { FileWithPreview } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileItem from "./FileItem";

interface ProcessedFilesProps {
  files: FileWithPreview[];
  onRemove: (file: FileWithPreview) => void;
  onUploadToDatabase: () => Promise<void>;
}

const ProcessedFiles = ({ files, onRemove, onUploadToDatabase }: ProcessedFilesProps) => {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processed Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file, index) => (
            <FileItem
              key={index}
              file={file}
              onRemove={onRemove}
              processed={true}
            />
          ))}
          <div className="flex justify-end mt-4">
            <Button onClick={onUploadToDatabase}>
              Upload All to Database
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessedFiles;