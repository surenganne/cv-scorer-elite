import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    console.log('Starting CV processing...')
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file) {
      console.error('No file provided')
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing file:', file.name)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock processed result
    const processedResult = {
      fileName: file.name,
      status: 'processed',
      candidateName: 'John Doe', // This would come from actual CV processing
      score: 85, // This would be calculated based on actual CV content
      matchPercentage: 75 // This would be calculated based on job requirements
    }

    console.log('Processing completed:', processedResult)

    return new Response(
      JSON.stringify(processedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Processing error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process CV', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})