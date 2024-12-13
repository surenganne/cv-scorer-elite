import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  selectedCandidates: Array<{
    name: string;
    score: number;
    file_name: string;
  }>;
  jobTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, selectedCandidates, jobTitle } = await req.json() as EmailRequest;

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

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);