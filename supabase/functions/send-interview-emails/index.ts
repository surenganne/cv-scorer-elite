import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { generateEmailHTML, Candidate } from './emailTemplate.ts';
import { processAttachments } from './attachments.ts';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  selectedCandidates: Candidate[];
  jobTitle: string;
}

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

    console.log("Processing request for candidates:", selectedCandidates.map(c => ({ name: c.name, file_path: c.file_path })));

    const validAttachments = await processAttachments(selectedCandidates);
    
    // Check if all attachments were processed successfully
    if (validAttachments.length !== selectedCandidates.length) {
      console.error('Not all attachments were processed successfully:', {
        processed: validAttachments.length,
        total: selectedCandidates.length,
        failed: selectedCandidates.length - validAttachments.length
      });
      
      return new Response(JSON.stringify({ 
        error: 'Failed to process all attachments',
        details: `Only ${validAttachments.length} out of ${selectedCandidates.length} attachments were processed successfully. Please try again.`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = generateEmailHTML(jobTitle, selectedCandidates);

    console.log("Sending email with attachments:", {
      recipientsCount: to.length,
      attachmentsCount: validAttachments.length,
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
        attachments: validAttachments,
      }),
    });

    const responseData = await res.json();
    console.log("Resend API response:", responseData);

    if (!res.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(responseData)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Email sent successfully with all ${validAttachments.length} attachments`,
      data: responseData
    }), {
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