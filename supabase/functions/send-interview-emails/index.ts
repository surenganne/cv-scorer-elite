import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";
import { generateEmailHTML } from "./emailTemplate.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const { to, selectedCandidates, jobTitle } = await req.json();

    if (!to || !Array.isArray(to) || to.length === 0) {
      throw new Error('Invalid recipients');
    }

    if (!selectedCandidates || !Array.isArray(selectedCandidates) || selectedCandidates.length === 0) {
      throw new Error('No candidates selected');
    }

    if (!jobTitle) {
      throw new Error('Job title is required');
    }

    // Generate email content
    const emailContent = generateEmailHTML(jobTitle, selectedCandidates);

    // Send email using Resend
    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: 'CV Scorer Elite <onboarding@resend.dev>',
      to,
      subject: `Interview Candidates for ${jobTitle} Position`,
      html: emailContent,
    });

    if (emailError) {
      console.error('Resend API error:', emailError);
      
      // Handle domain verification error
      if (emailError.statusCode === 403 && emailError.message?.includes('verify a domain')) {
        return new Response(
          JSON.stringify({
            error: 'Domain verification required',
            message: 'Please verify your domain at resend.com/domains before sending emails to other recipients.',
            details: emailError.message,
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      throw emailError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emails sent successfully',
        data: emailResponse,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-interview-emails:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error,
      }),
      {
        status: error.statusCode || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});