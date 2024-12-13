import { useState } from "react";
import { MatchEvidence } from "./MatchEvidence";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Match {
  id: string;
  file_name: string;
  upload_date: string;
  score: number;
  file_path?: string;
  evidence: {
    skills: string[];
    experience: string;
    education: string;
    certifications: string[];
  };
}

interface MatchesTableProps {
  matches: Match[];
  jobTitle: string;
  weights?: {
    experience_weight: number;
    skills_weight: number;
    education_weight: number;
    certifications_weight: number;
  };
}

export const MatchesTable = ({ matches, jobTitle, weights }: MatchesTableProps) => {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [emailAddresses, setEmailAddresses] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleViewResume = async (filePath: string) => {
    try {
      if (!filePath) {
        throw new Error("Invalid file path");
      }

      const { data, error } = await supabase.storage
        .from("cvs")
        .createSignedUrl(filePath, 3600);

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error("No signed URL returned");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error viewing resume:", error);
    }
  };

  const handleCheckboxChange = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleSendEmails = async () => {
    if (!emailAddresses.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    const emails = emailAddresses
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);

    if (!selectedCandidates.length) {
      toast({
        title: "Error",
        description: "Please select at least one candidate",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const selectedCandidatesData = matches
        .filter((match) => selectedCandidates.includes(match.id))
        .map((match) => ({
          name: match.file_name,
          score: match.score,
          file_name: match.file_name,
        }));

      const { data, error } = await supabase.functions.invoke(
        "send-interview-emails",
        {
          body: {
            to: emails,
            selectedCandidates: selectedCandidatesData,
            jobTitle,
          },
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Emails sent successfully",
      });

      setSelectedCandidates([]);
      setEmailAddresses("");
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          Top {matches.length} Matches
          <span className="text-sm font-normal text-gray-500">
            for {jobTitle}
          </span>
        </h3>
        
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Enter interviewer emails (comma-separated)"
            value={emailAddresses}
            onChange={(e) => setEmailAddresses(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSendEmails}
            disabled={isSending || !selectedCandidates.length || !emailAddresses.trim()}
          >
            <Mail className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send to Interviewers"}
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="font-semibold py-2 text-left">Candidate</TableHead>
                <TableHead className="font-semibold py-2">Match Analysis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow 
                  key={match.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="w-[50px]">
                    <Checkbox
                      checked={selectedCandidates.includes(match.id)}
                      onCheckedChange={() => handleCheckboxChange(match.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium py-2 text-left">
                    <div className="flex flex-col gap-2">
                      <span>{match.file_name}</span>
                      {match.file_path && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-fit"
                          onClick={() => handleViewResume(match.file_path!)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Resume
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-2xl py-2">
                    <MatchEvidence 
                      score={match.score} 
                      evidence={match.evidence} 
                      weights={weights}
                      isExpanded={expandedMatch === match.id}
                      onToggle={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};