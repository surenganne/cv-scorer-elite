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
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Upload Date</SelectItem>
          <SelectItem value="name">File Name</SelectItem>
          <SelectItem value="size">File Size</SelectItem>
        </SelectContent>
      </Select>
      <Button>
        Apply Filters
      </Button>
    </div>
  );
};