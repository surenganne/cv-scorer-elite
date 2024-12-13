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
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const requestData = await req.json();
    console.log('Received request data:', JSON.stringify(requestData, null, 2));

    const { to, selectedCandidates, jobTitle } = requestData;

    if (!to || !Array.isArray(to) || to.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid recipients',
          details: 'Please provide at least one recipient email address'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!selectedCandidates || !Array.isArray(selectedCandidates) || selectedCandidates.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No candidates selected',
          details: 'Please select at least one candidate'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!jobTitle) {
      return new Response(
        JSON.stringify({
          error: 'Job title required',
          details: 'Please provide a job title'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate email content with timeout
    const emailContent = await Promise.race([
      generateEmailHTML(jobTitle, selectedCandidates),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email generation timed out')), 25000)
      )
    ]);

    try {
      const { data: emailResponse, error: emailError } = await resend.emails.send({
        from: 'CV Scorer Elite <onboarding@resend.dev>',
        to,
        subject: `Interview Candidates for ${jobTitle} Position`,
        html: emailContent,
      });

      if (emailError) {
        console.error('Resend API error:', emailError);
        
        // Handle domain verification error specifically
        if (emailError.statusCode === 403 && emailError.message?.includes('verify a domain')) {
          return new Response(
            JSON.stringify({
              error: 'Domain verification required',
              message: 'Please verify your domain at resend.com/domains before sending emails to other recipients.',
              details: emailError.message
            }),
            {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        throw emailError;
      }

      console.log('Email sent successfully:', emailResponse);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Emails sent successfully',
          data: emailResponse
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          message: emailError.message,
          details: emailError
        }),
        {
          status: emailError.statusCode || 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    console.error('Error in send-interview-emails:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error
      }),
      {
        status: error.statusCode || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});