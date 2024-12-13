import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { MatchesTable } from "./MatchesTable";
import { useCVOperations } from "@/hooks/useCVOperations"; // Add this import

interface JobMatch {
  id: string;
  title: string;
  description: string;
  required_skills: string;
  minimum_experience: number;
  experience_weight: number;
  skills_weight: number;
  education_weight: number;
  certifications_weight: number;
  status: string;
  created_at: string;
}

export const JobMatchList = () => {
  const { toast } = useToast();
  const { handleViewCV } = useCVOperations(); // Add this hook
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [matchedCVs, setMatchedCVs] = useState<Record<string, any>>({});
  const [topMatches, setTopMatches] = useState<Record<string, number>>({});
  const [showFilters, setShowFilters] = useState<Record<string, boolean>>({});

  const { data: activeJobs } = useQuery({
    queryKey: ["activeJobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_descriptions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as JobMatch[];
    },
  });

  const findMatches = async (jobId: string) => {
    setLoading((prev) => ({ ...prev, [jobId]: true }));
    try {
      const job = activeJobs?.find((j) => j.id === jobId);
      if (!job) return;

      const { data: cvs, error } = await supabase
        .from("cv_uploads")
        .select("*");

      if (error) throw error;

      // Mock data with proper evidence structure
      const matches = cvs?.map((cv) => ({
        ...cv,
        score: Math.random() * 100,
        evidence: {
          skills: [
            "JavaScript",
            "React",
            "TypeScript",
            "Node.js",
          ],
          experience: "5 years of relevant experience in software development",
          education: "Bachelor's degree in Computer Science",
          certifications: [
            "AWS Certified Developer",
            "Professional Scrum Master I",
          ],
        },
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topMatches[jobId] || 5);

      setMatchedCVs((prev) => ({ ...prev, [jobId]: matches }));
      setShowFilters((prev) => ({ ...prev, [jobId]: true }));
      
      toast({
        title: "Matches Found",
        description: `Found top ${matches?.length || 0} potential matches for this position.`,
      });
    } catch (error) {
      console.error("Error finding matches:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to find matches. Please try again.",
      });
    } finally {
      setLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  if (!activeJobs?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active job descriptions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job Title</TableHead>
            <TableHead>Min. Experience</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeJobs?.map((job) => (
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
                  onClick={() => findMatches(job.id)}
                  disabled={loading[job.id]}
                >
                  {loading[job.id] ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  Find Matched Jobseekers
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {Object.entries(matchedCVs).map(([jobId, matches]) => {
        const job = activeJobs?.find((j) => j.id === jobId);
        if (!job || !matches?.length) return null;
        
        const weights = {
          experience_weight: job.experience_weight,
          skills_weight: job.skills_weight,
          education_weight: job.education_weight,
          certifications_weight: job.certifications_weight,
        };
        
        return (
          <div key={jobId} className="space-y-4">
            {showFilters[jobId] && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Show:</span>
                <Select
                  value={String(topMatches[jobId] || "5")}
                  onValueChange={(value) => {
                    setTopMatches(prev => ({ ...prev, [jobId]: Number(value) }));
                    findMatches(jobId);
                  }}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Top 5" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">Top 5</SelectItem>
                    <SelectItem value="10">Top 10</SelectItem>
                    <SelectItem value="15">Top 15</SelectItem>
                    <SelectItem value="20">Top 20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <MatchesTable 
              matches={matches} 
              jobTitle={job.title} 
              weights={weights}
              onViewResume={handleViewCV} // Add this prop
            />
          </div>
        );
      })}
    </div>
  );
};