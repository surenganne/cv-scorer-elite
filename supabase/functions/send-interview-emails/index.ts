import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { generateEmailHTML, Candidate } from './emailTemplate.ts';
import { processAttachments } from './attachments.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailRequest {
  to: string[];
  selectedCandidates: Candidate[];
  jobTitle: string;
}

const MAX_ATTACHMENTS = 5;
const MAX_RECIPIENTS = 5;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send interview emails");
    const { to, selectedCandidates, jobTitle } = await req.json() as EmailRequest;
    
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    // Validate request
    if (!to?.length || to.length > MAX_RECIPIENTS) {
      throw new Error(`Invalid number of recipients (max ${MAX_RECIPIENTS})`);
    }

    if (!selectedCandidates?.length || selectedCandidates.length > MAX_ATTACHMENTS) {
      throw new Error(`Invalid number of candidates (max ${MAX_ATTACHMENTS})`);
    }

    console.log("Processing request:", { 
      recipients: to.length,
      candidates: selectedCandidates.length,
      jobTitle 
    });

    const attachments = await processAttachments(selectedCandidates);
    const html = generateEmailHTML(jobTitle, selectedCandidates);

    console.log("Sending email with attachments:", {
      attachmentsCount: attachments.length,
      candidatesCount: selectedCandidates.length
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CV Scorer Elite <no-reply@incepta.ai>",
        to,
        subject: `Interview Candidates for ${jobTitle}`,
        html,
        attachments,
      }),
    });

    const responseData = await res.json();
    
    if (!res.ok) {
      console.error("Resend API error:", {
        status: res.status,
        response: responseData
      });
      throw new Error(responseData.message || `Failed to send email: ${res.status}`);
    }

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-interview-emails function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Check the function logs for more details"
      }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);