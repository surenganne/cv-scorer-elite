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
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { useRankedResumes } from "@/hooks/useRankedResumes";
import { RankedResumesList } from "./RankedResumesList";

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

interface RankedResume {
  rank: string;
  file_name: string;
  overall_match_with_jd: string;
  weights: {
    skills_weight: string;
    education_weight: string;
    experience_weight: string;
    certifications_weight: string;
  };
  matching_details?: {
    matching_skills: string[];
    matching_education: string[];
    matching_experience: string[];
    matching_certifications: string[];
  };
}

export const JobMatchList = () => {
  const { toast } = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const { data: activeJobs } = useQuery({
    queryKey: ["activeJobs"],
    queryFn: async () => {
      console.log("Fetching active jobs...");
      const { data, error } = await supabase
        .from("job_descriptions")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching active jobs:", error);
        throw error;
      }
      console.log("Active jobs fetched:", data);
      return data as JobMatch[];
    },
  });

  const { data: rankedResumes, isLoading: isLoadingMatches } = useRankedResumes(selectedJobId || "");

  const findMatches = (jobId: string) => {
    console.log("Finding matches for job ID:", jobId);
    console.log("Previous selectedJobId:", selectedJobId);
    setSelectedJobId(jobId);
    console.log("New selectedJobId set to:", jobId);
    toast({
      title: "Finding Matches",
      description: "Retrieving ranked resumes for this position...",
    });
  };

  if (!activeJobs?.length) {
    console.log("No active jobs found");
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No active job descriptions found.</p>
      </div>
    );
  }

  console.log("Current selectedJobId:", selectedJobId);
  console.log("Current rankedResumes:", rankedResumes);
  console.log("isLoadingMatches:", isLoadingMatches);

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
                  disabled={isLoadingMatches && selectedJobId === job.id}
                >
                  {isLoadingMatches && selectedJobId === job.id ? (
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

      {selectedJobId && rankedResumes && rankedResumes.length > 0 && (
        <RankedResumesList resumes={rankedResumes as RankedResume[]} />
      )}
    </div>
  );
};