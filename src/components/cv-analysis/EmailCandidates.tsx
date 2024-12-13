import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailCandidatesProps {
  selectedCandidates: string[];
  matches: Array<{
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
  jobTitle: string;
  onEmailsSent: () => void;
}

export const EmailCandidates = ({ 
  selectedCandidates, 
  matches, 
  jobTitle,
  onEmailsSent 
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
      const selectedCandidatesData = matches
        .filter((match) => selectedCandidates.includes(match.id))
        .map((match) => ({
          name: match.file_name,
          score: match.score,
          file_name: match.file_name,
          file_path: match.file_path,
          evidence: match.evidence,
        }));

      console.log('Sending email with data:', {
        to: emails,
        selectedCandidates: selectedCandidatesData,
        jobTitle,
      });

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

      if (error) {
        // Check for domain verification error
        if (error.message?.includes('verify a domain') || error.message?.includes('Domain verification required')) {
          toast({
            title: "Domain Verification Required",
            description: "Please verify your domain at resend.com/domains before sending emails to other recipients.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Success",
        description: "Emails sent successfully",
      });

      onEmailsSent();
      setEmailAddresses("");
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send emails. Please try again.",
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
    </div>
  );
};