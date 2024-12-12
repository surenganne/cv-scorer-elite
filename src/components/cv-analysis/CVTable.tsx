import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type CV = {
  id: string;
  candidateName: string;
  score: number;
  matchPercentage: number;
  status: "Pending" | "Reviewed" | "Shortlisted";
  uploadDate: string;
};

const mockData: CV[] = [
  {
    id: "1",
    candidateName: "John Smith",
    score: 85,
    matchPercentage: 78,
    status: "Reviewed",
    uploadDate: "2024-02-20",
  },
  {
    id: "2",
    candidateName: "Sarah Johnson",
    score: 92,
    matchPercentage: 89,
    status: "Shortlisted",
    uploadDate: "2024-02-19",
  },
  {
    id: "3",
    candidateName: "Michael Brown",
    score: 67,
    matchPercentage: 62,
    status: "Pending",
    uploadDate: "2024-02-18",
  },
];

export const CVTable = () => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate Name</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Match %</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((cv) => (
            <TableRow key={cv.id}>
              <TableCell className="font-medium">{cv.candidateName}</TableCell>
              <TableCell>{cv.score}</TableCell>
              <TableCell>{cv.matchPercentage}%</TableCell>
              <TableCell>
                <Badge
                  variant={
                    cv.status === "Shortlisted"
                      ? "default"
                      : cv.status === "Reviewed"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {cv.status}
                </Badge>
              </TableCell>
              <TableCell>{cv.uploadDate}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
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