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
  evidence: {
    skills: string[];
    experience: string;
    education: string;
    certifications: string[];
  };
}

interface EmailRequest {
  to: string[];
  selectedCandidates: Candidate[];
  jobTitle: string;
}

const generateCandidateHTML = (candidate: Candidate) => {
  const skillsList = candidate.evidence.skills
    .map(skill => `<span style="display: inline-block; background-color: #EFF6FF; color: #2563EB; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin: 2px;">${skill}</span>`)
    .join(' ');

  const certificationsList = candidate.evidence.certifications
    .map(cert => `<span style="display: inline-block; background-color: #FEF3C7; color: #D97706; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin: 2px;">${cert}</span>`)
    .join(' ');

  return `
    <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #E5E7EB; border-radius: 8px;">
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0; color: #111827; font-size: 16px; font-weight: 600;">${candidate.name}</h3>
        <span style="display: inline-block; background-color: ${
          candidate.score >= 80 ? '#D1FAE5' : 
          candidate.score >= 60 ? '#FEF3C7' : 
          '#FEE2E2'
        }; color: ${
          candidate.score >= 80 ? '#059669' : 
          candidate.score >= 60 ? '#D97706' : 
          '#DC2626'
        }; padding: 4px 12px; border-radius: 9999px; font-size: 14px; margin-top: 8px;">
          ${Math.round(candidate.score)}% Match
        </span>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Skills</h4>
        <div>${skillsList}</div>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Experience</h4>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">${candidate.evidence.experience}</p>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Education</h4>
        <p style="margin: 0; color: #6B7280; font-size: 14px;">${candidate.evidence.education}</p>
      </div>

      ${candidate.evidence.certifications.length ? `
        <div>
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Certifications</h4>
          <div>${certificationsList}</div>
        </div>
      ` : ''}
    </div>
  `;
};

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
            console.log('Processing attachment for candidate:', candidate.name);
            
            // Get signed URL
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('cvs')
              .createSignedUrl(candidate.file_path!, 60);

            if (signedUrlError) {
              console.error('Error getting signed URL:', signedUrlError);
              return null;
            }

            console.log('Got signed URL:', signedUrlData.signedUrl);

            // Download file
            const fileResponse = await fetch(signedUrlData.signedUrl);
            if (!fileResponse.ok) {
              console.error('Error downloading file:', fileResponse.statusText);
              return null;
            }

            // Convert file to base64
            const fileArrayBuffer = await fileResponse.arrayBuffer();
            const uint8Array = new Uint8Array(fileArrayBuffer);
            const base64String = btoa(String.fromCharCode.apply(null, uint8Array));

            console.log('Successfully processed file:', candidate.file_name);

            return {
              filename: candidate.file_name,
              content: base64String,
            };
          } catch (error) {
            console.error('Error processing attachment:', error);
            return null;
          }
        })
    );

    const validAttachments = attachments.filter(Boolean);
    console.log(`Successfully processed ${validAttachments.length} attachments`);

    const candidatesHTML = selectedCandidates
      .map(candidate => generateCandidateHTML(candidate))
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: system-ui, -apple-system, sans-serif; padding: 24px; max-width: 600px; margin: 0 auto;">
          <div style="margin-bottom: 24px;">
            <h1 style="color: #111827; font-size: 24px; margin: 0 0 8px 0;">Selected Candidates for ${jobTitle}</h1>
            <p style="color: #6B7280; margin: 0;">Here are the candidates selected for interview, along with their match analysis and CVs (attached).</p>
          </div>

          <div style="margin-bottom: 32px;">
            ${candidatesHTML}
          </div>

          <div style="color: #6B7280; font-size: 14px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
            <p style="margin: 0;">Please review their profiles and CVs (attached) to schedule interviews accordingly.</p>
          </div>
        </body>
      </html>
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
        details: "Check the function logs for more details"
      }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);