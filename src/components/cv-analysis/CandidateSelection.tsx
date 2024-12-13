import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CandidateSelectionProps {
  matches: Array<{
    id: string;
    file_name: string;
    score: number;
  }>;
  jobTitle: string;
}

export const CandidateSelection = ({ matches, jobTitle }: CandidateSelectionProps) => {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [emailAddresses, setEmailAddresses] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

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

      // Reset selection
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
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
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
      <div className="space-y-2">
        {matches.map((match) => (
          <div key={match.id} className="flex items-center space-x-2">
            <Checkbox
              id={match.id}
              checked={selectedCandidates.includes(match.id)}
              onCheckedChange={() => handleCheckboxChange(match.id)}
            />
            <label
              htmlFor={match.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {match.file_name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};