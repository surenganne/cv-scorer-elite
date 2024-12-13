import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, Calendar, FileType } from "lucide-react";
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
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">File Name</TableHead>
            <TableHead className="font-semibold">Size</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Upload Date</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((cv) => (
            <TableRow key={cv.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  {cv.file_name}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileType className="h-4 w-4 text-gray-400" />
                  {formatFileSize(cv.file_size)}
                </div>
              </TableCell>
              <TableCell>{formatContentType(cv.content_type)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {cv.upload_date ? format(new Date(cv.upload_date), 'MMM dd, yyyy') : 'N/A'}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onView(cv.file_path)}
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDownload(cv.file_path, cv.file_name)}
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
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