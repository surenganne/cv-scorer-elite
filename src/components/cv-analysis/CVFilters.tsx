import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export const CVFilters = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Input
        placeholder="Search candidates..."
        className="max-w-xs"
      />
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="reviewed">Reviewed</SelectItem>
          <SelectItem value="shortlisted">Shortlisted</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score">Score</SelectItem>
          <SelectItem value="date">Upload Date</SelectItem>
          <SelectItem value="match">Match %</SelectItem>
        </SelectContent>
      </Select>
      <Button>
        Apply Filters
      </Button>
    </div>
  );
};