import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createHmac } from "https://deno.land/std@0.168.0/crypto/mod.ts"

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

    // Get current timestamp for AWS authentication
    const date = new Date()
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = date.toISOString().split('T')[0].replace(/-/g, '')

    // Create canonical request
    const method = 'POST'
    const canonicalUri = '/checkJobStatus'
    const canonicalQueryString = ''
    const canonicalHeaders = [
      `content-type:application/json`,
      `host:${new URL(baseUrl).host}`,
      `x-amz-date:${amzDate}`,
    ].join('\n') + '\n'
    const signedHeaders = 'content-type;host;x-amz-date'
    const payload = JSON.stringify({ job_id })
    const payloadHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(payload)
    ).then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''))

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n')

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256'
    const credentialScope = `${dateStamp}/us-east-1/execute-api/aws4_request`
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(canonicalRequest)
      ).then(hash => Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''))
    ].join('\n')

    // Calculate signature
    const signature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(stringToSign)
    ).then(hash => Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join(''))

    // Create authorization header
    const authorizationHeader = [
      `${algorithm} Credential=${apiKey}/${credentialScope}`,
      `SignedHeaders=${signedHeaders}`,
      `Signature=${signature}`
    ].join(', ')

    console.log('Making request with headers:', {
      'Content-Type': 'application/json',
      'X-Amz-Date': amzDate,
      'Authorization': authorizationHeader
    })

    const response = await fetch(
      `${baseUrl}/checkJobStatus`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Amz-Date': amzDate,
          'Authorization': authorizationHeader,
          'X-Api-Key': apiKey
        },
        body: payload
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