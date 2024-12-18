import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Evidence {
  skills: string[];
  experience: string;
  education: string;
  certifications: string[];
}

interface Candidate {
  id: string;
  file_name: string;
  file_path?: string;
  score: number | string;
  evidence: Evidence;
}

interface EmailCandidatesProps {
  selectedCandidates: Candidate[];
  onClose?: () => void;
  matches?: Candidate[];
  jobTitle?: string;
  onEmailsSent?: () => void;
}

export const EmailCandidates = ({ 
  selectedCandidates, 
  matches, 
  jobTitle,
  onEmailsSent,
  onClose 
}: EmailCandidatesProps) => {
  const [emailAddresses, setEmailAddresses] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

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
      console.log('Starting email preparation with matches:', matches);
      
      // First, get the correct file paths from cv_uploads table
      const selectedCandidatesData = await Promise.all(
        selectedCandidates.map(async (candidate) => {
          console.log('Processing candidate:', candidate);
          console.log('Original score:', candidate.score);
          
          // Get the correct file path from cv_uploads if not already present
          let filePath = candidate.file_path;
          if (!filePath) {
            const { data: cvData, error: cvError } = await supabase
              .from("cv_uploads")
              .select("file_path")
              .ilike("file_name", candidate.file_name)
              .single();

            if (cvError) {
              console.error("Error fetching CV data:", cvError);
              throw new Error(`Could not find CV file for ${candidate.file_name}`);
            }
            filePath = cvData.file_path;
          }

          // Parse score handling both string and number formats
          let score: number;
          if (typeof candidate.score === 'string') {
            // Remove '%' if present and convert to number
            score = parseFloat(candidate.score.replace('%', ''));
            console.log('Parsed string score:', score);
          } else {
            score = candidate.score;
          }

          // If score is NaN or 0, try to calculate from evidence
          if (isNaN(score) || score === 0) {
            console.log('Score is invalid, calculating from evidence:', candidate.evidence);
            const evidenceScore = (
              (candidate.evidence.skills?.length || 0) * 10 +
              (candidate.evidence.experience ? 30 : 0) +
              (candidate.evidence.education ? 30 : 0) +
              (candidate.evidence.certifications?.length || 0) * 10
            );
            score = Math.min(evidenceScore, 100);
            console.log('Calculated evidence-based score:', score);
          }

          return {
            name: candidate.file_name,
            score,
            file_name: candidate.file_name,
            file_path: filePath,
            evidence: candidate.evidence,
          };
        })
      );

      console.log('Final email data:', {
        to: emails,
        selectedCandidates: selectedCandidatesData,
        jobTitle: jobTitle || 'Position',
      });

      const { data, error } = await supabase.functions.invoke(
        "send-interview-emails",
        {
          body: {
            to: emails,
            selectedCandidates: selectedCandidatesData,
            jobTitle: jobTitle || 'Position',
          },
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Emails sent successfully",
      });

      if (onEmailsSent) onEmailsSent();
      if (onClose) onClose();
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
      {onClose && (
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      )}
    </div>
  );
};