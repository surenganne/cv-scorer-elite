import { Badge } from "@/components/ui/badge";

interface MatchScoreBadgeProps {
  score: string;
}

export const MatchScoreBadge = ({ score }: MatchScoreBadgeProps) => {
  return (
    <Badge 
      variant="secondary" 
      className="text-base bg-gradient-to-r from-purple-50 to-blue-50 text-gray-700 border border-purple-100"
    >
      {score} Match
    </Badge>
  );
};