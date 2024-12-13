import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Candidate {
  name: string;
  score: number;
  file_name: string;
  file_path?: string;
}

interface EmailRequest {
  to: string[];
  selectedCandidates: Candidate[];
  jobTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send interview emails");
    const { to, selectedCandidates, jobTitle } = await req.json() as EmailRequest;
    
    if (!RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    console.log("Request data:", { to, selectedCandidates, jobTitle });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get signed URLs and download files for each candidate
    const attachments = await Promise.all(
      selectedCandidates
        .filter(candidate => candidate.file_path)
        .map(async (candidate) => {
          try {
            // Get signed URL
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('cvs')
              .createSignedUrl(candidate.file_path!, 60); // 60 seconds expiry

            if (signedUrlError) {
              console.error('Error getting signed URL:', signedUrlError);
              return null;
            }

            // Download file
            const fileResponse = await fetch(signedUrlData.signedUrl);
            if (!fileResponse.ok) {
              console.error('Error downloading file:', fileResponse.statusText);
              return null;
            }

            const fileBuffer = await fileResponse.arrayBuffer();
            return {
              filename: candidate.file_name,
              content: new Uint8Array(fileBuffer),
            };
          } catch (error) {
            console.error('Error processing attachment:', error);
            return null;
          }
        })
    );

    const validAttachments = attachments.filter(Boolean);
    console.log(`Successfully processed ${validAttachments.length} attachments`);

    const candidatesList = selectedCandidates
      .map(
        (candidate) =>
          `<li>${candidate.name} - Match Score: ${candidate.score.toFixed(1)}%</li>`
      )
      .join("");

    const html = `
      <h2>Selected Candidates for ${jobTitle}</h2>
      <p>Here are the candidates selected for interview:</p>
      <ul>
        ${candidatesList}
      </ul>
      <p>Please review their resumes (attached) and schedule interviews accordingly.</p>
    `;

    console.log("Sending email with HTML and attachments");

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

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-interview-emails function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.cause || "Check the function logs for more details"
      }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);