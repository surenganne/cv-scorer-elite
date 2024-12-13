import { FileWithPreview } from "@/types/file";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileItem from "./FileItem";

interface SelectedFilesProps {
  files: FileWithPreview[];
  onRemove: (file: FileWithPreview) => void;
  onProcess: (file: FileWithPreview) => Promise<void>;
}

const SelectedFiles = ({ files, onRemove, onProcess }: SelectedFilesProps) => {
  if (files.length === 0) return null;

  const handleProcessAll = async () => {
    for (const file of files) {
      await onProcess(file);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Selected Files</CardTitle>
        <Button onClick={handleProcessAll}>
          Process {files.length} Files
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file, index) => (
            <FileItem
              key={index}
              file={file}
              onRemove={onRemove}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectedFiles;