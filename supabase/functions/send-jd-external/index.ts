import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { jobData } = await req.json()
    console.log('Received job data:', jobData)

    // Here you would typically send the data to your external API
    // For demonstration, we'll log it and mock an external API call
    const externalApiUrl = Deno.env.get('EXTERNAL_API_URL')
    if (!externalApiUrl) {
      throw new Error('External API URL not configured')
    }

    // Send to external API
    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers for your external API
      },
      body: JSON.stringify(jobData)
    })

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`)
    }

    const result = await response.json()
    console.log('External API response:', result)

    return new Response(
      JSON.stringify({ success: true, message: 'Job description sent to external source' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in send-jd-external function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})