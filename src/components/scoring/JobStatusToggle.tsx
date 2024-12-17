import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface JobStatusToggleProps {
  isActive: boolean;
  onToggle: (value: boolean) => void;
}

export const JobStatusToggle = ({ isActive, onToggle }: JobStatusToggleProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2">
        <Switch
          id="job-status"
          checked={isActive}
          onCheckedChange={onToggle}
        />
        <Label htmlFor="job-status">
          Job Status: {isActive ? 'Active' : 'Inactive'}
        </Label>
      </div>
    </div>
  );
};