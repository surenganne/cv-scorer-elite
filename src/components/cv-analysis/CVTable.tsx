import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type CV = {
  id: string;
  file_name: string;
  file_path: string;
  content_type: string;
  file_size: number;
  upload_date: string;
};

interface CVTableProps {
  data?: CV[];
  onView: (filePath: string) => void;
  onDownload: (filePath: string, fileName: string) => void;
}

export const CVTable = ({ data = [], onView, onDownload }: CVTableProps) => {
  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatContentType = (contentType: string) => {
    switch (contentType) {
      case 'application/pdf':
        return 'PDF';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'DOC/DOCX';
      default:
        return contentType;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((cv) => (
            <TableRow key={cv.id}>
              <TableCell className="font-medium">{cv.file_name}</TableCell>
              <TableCell>{formatFileSize(cv.file_size)}</TableCell>
              <TableCell>{formatContentType(cv.content_type)}</TableCell>
              <TableCell>
                {cv.upload_date ? format(new Date(cv.upload_date), 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onView(cv.file_path)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDownload(cv.file_path, cv.file_name)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};