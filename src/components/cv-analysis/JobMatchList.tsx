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
import { RankedResumesTable } from "./RankedResumesTable";
import { RankedResume } from "@/types/ranked-resume";

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

interface RankingResponse {
  ranked_resumes: {
    message: string;
    ranking: Array<{
      rank: string;
      weights: {
        skills_weight: string;
        education_weight: string;
        experience_weight: string;
        certifications_weight: string;
      };
      file_name: string;
      matching_details: {
        matching_skills: string[];
        matching_education: string[];
        matching_experience: string[];
        matching_certifications: string[];
      };
      overall_match_with_jd: string;
    }>;
  };
}

export const JobMatchList = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [matchedResumes, setMatchedResumes] = useState<Record<string, RankedResume[]>>({});
  const [topN, setTopN] = useState<Record<string, number>>({});

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
    const cleanJobId = jobId.replace(/^eq\./, '');
    setLoading((prev) => ({ ...prev, [cleanJobId]: true }));
    
    try {
      // First get the ranking data
      const { data: rankingData, error: rankingError } = await supabase
        .from("edb_cv_ranking")
        .select("ranked_resumes")
        .eq("job_id", cleanJobId)
        .single();

      if (rankingError) throw rankingError;

      const response = rankingData as RankingResponse;
      const rankedResumes = response?.ranked_resumes?.ranking || [];
      
      if (rankedResumes.length > 0) {
        // Get all unique file names from ranked resumes
        const fileNames = rankedResumes.map(resume => resume.file_name);
        
        // Fetch corresponding file paths from cv_uploads
        const { data: cvData, error: cvError } = await supabase
          .from("cv_uploads")
          .select("file_name, file_path")
          .in("file_name", fileNames);

        if (cvError) throw cvError;

        // Create a map of file names to their actual paths and names
        const fileMap = cvData?.reduce((acc, cv) => {
          acc[cv.file_name] = {
            file_path: cv.file_path,
            actual_file_name: cv.file_name
          };
          return acc;
        }, {} as Record<string, { file_path: string, actual_file_name: string }>);

        // Enrich ranked resumes with actual file paths and names
        const enrichedResumes = rankedResumes.map(resume => {
          const fileInfo = fileMap[resume.file_name] || {
            file_path: resume.file_name,
            actual_file_name: resume.file_name
          };
          
          return {
            ...resume,
            file_path: fileInfo.file_path,
            actual_file_name: fileInfo.actual_file_name,
            overall_match_with_jd: resume.overall_match_with_jd.replace('%', '')
          };
        });

        setMatchedResumes((prev) => ({
          ...prev,
          [cleanJobId]: enrichedResumes,
        }));
        setTopN((prev) => ({ ...prev, [cleanJobId]: 10 }));

        toast({
          title: "Matches Found",
          description: `Found ${enrichedResumes.length} potential matches for this position.`,
        });
      } else {
        toast({
          title: "No Matches Found",
          description: "No ranked resumes available for this position.",
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
      setLoading((prev) => ({ ...prev, [cleanJobId]: false }));
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

      {Object.entries(matchedResumes).map(([jobId, resumes]) => {
        const job = activeJobs?.find((j) => j.id === jobId);
        if (!job || !resumes?.length) return null;

        return (
          <div key={jobId} className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Matched Candidates for {job.title}
                </h3>
              </div>
              
              <RankedResumesTable
                resumes={resumes}
                topN={topN[jobId]}
                onTopNChange={(value) => setTopN(prev => ({ ...prev, [jobId]: value }))}
                jobWeights={{
                  experience_weight: job.experience_weight,
                  skills_weight: job.skills_weight,
                  education_weight: job.education_weight,
                  certifications_weight: job.certifications_weight,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};