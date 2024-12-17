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
import { Loader2, LayoutGrid, Table as TableIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { RankedResumesList } from "./RankedResumesList";
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

export const JobMatchList = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [matchedResumes, setMatchedResumes] = useState<Record<string, RankedResume[]>>({});
  const [showFilters, setShowFilters] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<Record<string, 'grid' | 'table'>>({});
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
    setLoading((prev) => ({ ...prev, [jobId]: true }));
    try {
      const { data: rankingData, error: rankingError } = await supabase
        .from("edb_cv_ranking")
        .select("ranked_resumes")
        .eq("job_id", jobId)
        .single();

      if (rankingError) throw rankingError;

      if (rankingData?.ranked_resumes) {
        const rankedResumes = rankingData.ranked_resumes as unknown as RankedResume[];
        
        const filePaths = rankedResumes.map(resume => resume.file_name);
        
        const { data: cvData, error: cvError } = await supabase
          .from("cv_uploads")
          .select("file_name, file_path")
          .in("file_path", filePaths);

        if (cvError) throw cvError;

        const fileNameMap = cvData?.reduce((acc, cv) => {
          acc[cv.file_path] = cv.file_name;
          return acc;
        }, {} as Record<string, string>) || {};

        const enrichedResumes = rankedResumes.map(resume => ({
          ...resume,
          actual_file_name: fileNameMap[resume.file_name] || resume.file_name,
          file_name: fileNameMap[resume.file_name] || resume.file_name
        }));

        setMatchedResumes((prev) => ({
          ...prev,
          [jobId]: enrichedResumes,
        }));
        setShowFilters((prev) => ({ ...prev, [jobId]: true }));
        setViewMode((prev) => ({ ...prev, [jobId]: 'grid' }));
        setTopN((prev) => ({ ...prev, [jobId]: 10 }));

        toast({
          title: "Matches Found",
          description: `Found ${enrichedResumes.length} potential matches for this position.`,
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(prev => ({
                      ...prev,
                      [jobId]: prev[jobId] === 'grid' ? 'table' : 'grid'
                    }))}
                  >
                    {viewMode[jobId] === 'grid' ? (
                      <TableIcon className="h-4 w-4 mr-2" />
                    ) : (
                      <LayoutGrid className="h-4 w-4 mr-2" />
                    )}
                    {viewMode[jobId] === 'grid' ? 'Table View' : 'Grid View'}
                  </Button>
                </div>
              </div>
              
              {viewMode[jobId] === 'grid' ? (
                <RankedResumesList resumes={resumes} />
              ) : (
                <RankedResumesTable
                  resumes={resumes}
                  topN={topN[jobId]}
                  onTopNChange={(value) => setTopN(prev => ({ ...prev, [jobId]: value }))}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};