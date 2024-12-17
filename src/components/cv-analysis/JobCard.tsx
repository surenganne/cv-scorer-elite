import { format } from "date-fns";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    minimum_experience: number;
    created_at: string;
  };
  loading: boolean;
  onFindMatches: (jobId: string) => void;
}

export const JobCard = ({ job, loading, onFindMatches }: JobCardProps) => {
  return (
    <TableRow>
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
          disabled={loading}
        >
          {loading ? (
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