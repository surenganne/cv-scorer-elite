import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { job_id } = await req.json()
    console.log('Checking status for job:', job_id)
    
    const baseUrl = Deno.env.get('JOB_STATUS_API_URL')
    if (!baseUrl) {
      throw new Error('JOB_STATUS_API_URL environment variable is not set')
    }

    // Call the external API with proper error handling
    const response = await fetch(
      `${baseUrl}/checkJobStatus`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          job_id: job_id
        }),
      }
    )

    // Log the response status and headers for debugging
    console.log('API Response Status:', response.status)
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      return new Response(JSON.stringify({ 
        error: `API responded with status: ${response.status}`,
        details: errorText,
        status: 'FAILED',
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      })
    }

    const data = await response.json()
    console.log('Job status response:', data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error checking job status:', error)
    
    // Return a more detailed error response
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'FAILED',
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})