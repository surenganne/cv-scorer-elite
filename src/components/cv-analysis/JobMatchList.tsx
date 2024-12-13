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
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [matchedCVs, setMatchedCVs] = useState<Record<string, any>>({});
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

      const { data: cvs, error } = await supabase
        .from("cv_uploads")
        .select("*");

      if (error) throw error;

      // For now, we'll implement a simple matching algorithm
      // This can be enhanced with more sophisticated matching logic
      const matches = cvs?.map((cv) => ({
        ...cv,
        score: Math.random() * 100, // Placeholder for actual matching logic
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topMatches[jobId] || 5); // Use selected top matches count, default to 5

      setMatchedCVs((prev) => ({ ...prev, [jobId]: matches }));
      
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
            <TableHead>Top Matches</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.minimum_experience} years</TableCell>
              <TableCell>
                {format(new Date(job.created_at), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <Select
                  value={String(topMatches[job.id] || "5")}
                  onValueChange={(value) => 
                    setTopMatches(prev => ({ ...prev, [job.id]: Number(value) }))
                  }
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
        const job = activeJobs.find((j) => j.id === jobId);
        if (!job || !matches?.length) return null;

        return (
          <div key={jobId} className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">
              Top {matches.length} Matches for: {job.title}
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Upload Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match: any) => (
                  <TableRow key={match.id}>
                    <TableCell>{match.file_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${match.score}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {Math.round(match.score)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(match.upload_date), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
};