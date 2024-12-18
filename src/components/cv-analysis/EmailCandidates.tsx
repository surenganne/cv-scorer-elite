import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailCandidatesProps {
  selectedCandidates: string[];
  onClose?: () => void;
  matches?: Array<{
    id: string;
    file_name: string;
    file_path?: string;
    score: number;
    evidence: {
      skills: string[];
      experience: string;
      education: string;
      certifications: string[];
    };
  }>;
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
      // First, get the correct file paths from cv_uploads table
      const selectedCandidatesData = matches
        ? await Promise.all(
            matches
              .filter((match) => selectedCandidates.includes(match.id))
              .map(async (match) => {
                // Get the correct file path from cv_uploads
                const { data: cvData, error: cvError } = await supabase
                  .from("cv_uploads")
                  .select("file_path")
                  .ilike("file_name", match.file_name)
                  .single();

                if (cvError) {
                  console.error("Error fetching CV data:", cvError);
                  throw new Error(`Could not find CV file for ${match.file_name}`);
                }

                // Parse the score from the match object
                const score = parseFloat(match.score.toString());

                return {
                  name: match.file_name,
                  score: isNaN(score) ? 0 : score,
                  file_name: match.file_name,
                  file_path: cvData.file_path,
                  evidence: match.evidence,
                };
              })
          )
        : await Promise.all(
            selectedCandidates.map(async (candidate) => {
              const { data: cvData, error: cvError } = await supabase
                .from("cv_uploads")
                .select("file_path")
                .ilike("file_name", candidate)
                .single();

              if (cvError) {
                console.error("Error fetching CV data:", cvError);
                throw new Error(`Could not find CV file for ${candidate}`);
              }

              return {
                name: candidate,
                file_name: candidate,
                file_path: cvData.file_path,
                score: 0,
                evidence: {
                  skills: [],
                  experience: "",
                  education: "",
                  certifications: [],
                }
              };
            })
          );

      console.log('Sending email with data:', {
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