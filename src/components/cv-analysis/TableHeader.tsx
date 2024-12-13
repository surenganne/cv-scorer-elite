import { Checkbox } from "@/components/ui/checkbox";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
}

export const TableHeaderComponent = ({ onSelectAll, allSelected }: TableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow className="bg-gray-50">
        <TableHead className="w-[50px]">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all candidates"
          />
        </TableHead>
        <TableHead className="font-semibold py-2 text-left">Candidate</TableHead>
        <TableHead className="font-semibold py-2">Match Analysis</TableHead>
      </TableRow>
    </TableHeader>
  );
};