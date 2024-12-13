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
    console.log('Starting CV upload process...')
    
    // Get the request body as text first
    const bodyText = await req.text()
    console.log('Received body text:', bodyText)

    // Try to parse the JSON
    let fileData
    try {
      fileData = JSON.parse(bodyText)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON data', details: parseError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Parsed file data:', fileData)

    if (!fileData || !fileData.name) {
      console.error('Invalid file data structure')
      return new Response(
        JSON.stringify({ error: 'Invalid file data structure' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert the CV data into the database
    const { data, error: dbError } = await supabase
      .from('cv_uploads')
      .insert({
        file_name: fileData.name,
        file_path: fileData.preview || '',
        content_type: fileData.type,
        file_size: fileData.size,
        status: 'Uploaded',
        score: fileData.score || 0,
        match_percentage: fileData.matchPercentage || 0,
      })
      .select()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save CV data', details: dbError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('CV upload completed successfully:', data)
    return new Response(
      JSON.stringify({ message: 'CV uploaded successfully', data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})