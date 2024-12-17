import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MatchesTable } from "./MatchesTable";
import { JobCard } from "./JobCard";
import { fetchRankedResumes } from "@/services/rankingApi";
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
  const [matchedCVs, setMatchedCVs] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState<Record<string, boolean>>({});
  const [topMatches, setTopMatches] = useState<Record<string, number>>({});

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

      const jobData = {
        title: job.title,
        description: job.description,
        required_skills: job.required_skills,
        minimum_experience: job.minimum_experience,
        preferred_qualifications: job.preferred_qualifications,
        weights: {
          experience_weight: job.experience_weight,
          skills_weight: job.skills_weight,
          education_weight: job.education_weight,
          certifications_weight: job.certifications_weight,
        },
      };

      const matches = await fetchRankedResumes(jobId, jobData);
      
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
            <JobCard
              key={job.id}
              job={job}
              loading={loading[job.id] || false}
              onFindMatches={findMatches}
            />
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
                <select
                  value={String(topMatches[jobId] || "5")}
                  onChange={(e) => {
                    setTopMatches(prev => ({ ...prev, [jobId]: Number(e.target.value) }));
                    findMatches(jobId);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="5">Top 5</option>
                  <option value="10">Top 10</option>
                  <option value="15">Top 15</option>
                  <option value="20">Top 20</option>
                </select>
              </div>
            )}
            <MatchesTable 
              matches={matches} 
              jobTitle={job.title} 
              weights={weights}
              onViewResume={handleViewCV}
            />
          </div>
        );
      })}
    </div>
  );
};