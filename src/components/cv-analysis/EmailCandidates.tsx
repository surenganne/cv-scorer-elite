import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface EmailCandidatesProps {
  selectedCandidates: Array<{
    name: string;
    file_name: string;
    file_path: string;
  }>;
  onClose: () => void;
}

export const EmailCandidates = ({ selectedCandidates, onClose }: EmailCandidatesProps) => {
  const [emailContent, setEmailContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendEmails = async () => {
    setLoading(true);
    try {
      const emailRequests = selectedCandidates.map((candidate) => ({
        name: candidate.name,
        file_name: candidate.file_name,
        file_path: candidate.file_path,
      }));

      const response = await fetch("/api/send-interview-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidates: emailRequests,
          emailContent: `${emailContent}\n\nCandidate Information:\n${selectedCandidates.map(candidate => 
            `Name: ${candidate.name}\nFile Path: ${candidate.file_path}`
          ).join('\n\n')}`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send emails");
      }

      toast({
        title: "Success",
        description: "Interview emails have been sent successfully.",
      });
      onClose();
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send interview emails. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Interview Emails</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-content">Email Content</Label>
            <Textarea
              id="email-content"
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              placeholder="Enter the email content..."
              className="h-40"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSendEmails} disabled={loading || !emailContent.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Emails ({selectedCandidates.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};