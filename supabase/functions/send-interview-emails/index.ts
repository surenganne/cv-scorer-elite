import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
      <p>Please review their resumes and schedule interviews accordingly.</p>
    `;

    console.log("Sending email with HTML:", html);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "CV Scorer Elite <onboarding@resend.dev>",
        to,
        subject: `Interview Candidates for ${jobTitle}`,
        html,
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