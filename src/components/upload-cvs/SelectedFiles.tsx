import { FileWithPreview } from "@/types/file";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileItem from "./FileItem";

interface SelectedFilesProps {
  files: FileWithPreview[];
  onRemove: (file: FileWithPreview) => void;
  onProcess: (file: FileWithPreview) => Promise<void>;
}

const SelectedFiles = ({ files, onRemove, onProcess }: SelectedFilesProps) => {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selected Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file, index) => (
            <FileItem
              key={index}
              file={file}
              onRemove={onRemove}
              onUpload={onProcess}
              buttonText="Process"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedFiles;