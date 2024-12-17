import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

interface CVFiltersProps {
  onSearch: (query: string) => void;
  onSort: (criteria: string) => void;
  onTopNChange: (value: string) => void;
  topN: string;
}

export const CVFilters = ({ onSearch, onSort, onTopNChange, topN }: CVFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            className="pl-9 max-w-md"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select value={topN} onValueChange={onTopNChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Top N Resumes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="15">Top 15</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={onSort}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Upload Date</SelectItem>
              <SelectItem value="name">File Name</SelectItem>
              <SelectItem value="size">File Size</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  );
};