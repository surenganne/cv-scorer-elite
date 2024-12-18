import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { job_id } = await req.json()
    console.log('Checking status for job:', job_id)
    
    const baseUrl = Deno.env.get('JOB_STATUS_API_URL')
    const apiKey = Deno.env.get('JOB_STATUS_API_KEY')
    
    if (!baseUrl) {
      throw new Error('JOB_STATUS_API_URL environment variable is not set')
    }

    if (!apiKey) {
      throw new Error('JOB_STATUS_API_KEY environment variable is not set')
    }

    const response = await fetch(
      `${baseUrl}/checkJobStatus`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': apiKey, // Changed format: removed Bearer prefix
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          job_id: job_id
        }),
      }
    )

    console.log('API Response Status:', response.status)
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch job status',
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

    // Transform the response to match the expected format
    const transformedResponse = {
      message: "Job status fetched successfully",
      job_id: data.job_id,
      status: data.status
    }

    return new Response(JSON.stringify(transformedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error checking job status:', error)
    
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