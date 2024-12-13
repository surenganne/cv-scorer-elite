import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { processAttachments } from "./attachments.ts";
import { generateEmailContent } from "./emailTemplate.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Log incoming request details
  console.log('Received request:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY');
    }

    // Parse and validate request body
    let requestData;
    try {
      requestData = await req.json();
      console.log('Request payload:', JSON.stringify(requestData, null, 2));
    } catch (error) {
      throw new Error(`Invalid JSON payload: ${error.message}`);
    }

    const { to, selectedCandidates, jobTitle } = requestData;

    // Validate required fields
    if (!to || !Array.isArray(to) || to.length === 0) {
      throw new Error('Invalid or missing recipient emails');
    }

    if (!selectedCandidates || !Array.isArray(selectedCandidates) || selectedCandidates.length === 0) {
      throw new Error('No candidates selected');
    }

    if (!jobTitle) {
      throw new Error('Job title is required');
    }

    // Process attachments
    console.log('Processing attachments...');
    const attachments = await processAttachments(selectedCandidates);
    console.log(`Processed ${attachments.length} attachments`);

    // Generate email content
    const emailContent = generateEmailContent(selectedCandidates, jobTitle);

    // Prepare email data
    const emailData = {
      from: "CV Scorer Elite <onboarding@resend.dev>",
      to,
      subject: `Interview Candidates for ${jobTitle} Position`,
      html: emailContent,
      attachments
    };

    // Send email
    console.log('Sending email to Resend API...');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', responseData);
      throw new Error(`Resend API error: ${JSON.stringify(responseData)}`);
    }

    console.log('Email sent successfully:', responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in send-interview-emails function:', error);
    
    const errorResponse = {
      error: error.message,
      details: 'Check function logs for more information'
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});