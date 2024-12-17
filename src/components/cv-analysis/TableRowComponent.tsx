import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Loader2, Users } from "lucide-react";
import { format } from "date-fns";

interface TableRowProps {
  job: {
    id: string;
    title: string;
    minimum_experience: number;
    created_at: string;
  };
  onFindMatches: (id: string) => void;
  isLoading: boolean;
}

export const TableRowComponent = ({ job, onFindMatches, isLoading }: TableRowProps) => {
  return (
    <TableRow key={job.id}>
      <TableCell className="font-medium">{job.title}</TableCell>
      <TableCell>{job.minimum_experience} years</TableCell>
      <TableCell>
        {format(new Date(job.created_at), "MMM dd, yyyy")}
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFindMatches(job.id)}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Users className="h-4 w-4 mr-2" />
          )}
          Find Matched Jobseekers
        </Button>
      </TableCell>
    </TableRow>
  );
};