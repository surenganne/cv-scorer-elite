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
import { RankedResumesList } from "./RankedResumesList";
import { useCVOperations } from "@/hooks/useCVOperations";

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
  preferred_qualifications?: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export const JobMatchList = () => {
  const { toast } = useToast();
  const { handleViewCV } = useCVOperations();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [rankedResumes, setRankedResumes] = useState<Record<string, any>>({});
  const [showRankings, setShowRankings] = useState<Record<string, boolean>>({});

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
      const { data: rankingData, error: rankingError } = await supabase
        .from("edb_cv_ranking")
        .select("ranked_resumes")
        .eq("job_id", jobId)
        .single();

      if (rankingError) throw rankingError;

      if (rankingData?.ranked_resumes) {
        setRankedResumes((prev) => ({ ...prev, [jobId]: rankingData.ranked_resumes }));
        setShowRankings((prev) => ({ ...prev, [jobId]: true }));
        
        toast({
          title: "Matches Found",
          description: `Found ${rankingData.ranked_resumes.length} potential matches for this position.`,
        });
      }
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

      {Object.entries(rankedResumes).map(([jobId, matches]) => {
        const job = activeJobs?.find((j) => j.id === jobId);
        if (!job || !matches?.length || !showRankings[jobId]) return null;
        
        return (
          <div key={jobId} className="mt-8 space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ranked Matches for {job.title}
              </h3>
              <RankedResumesList 
                data={matches} 
                onViewResume={handleViewCV}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};