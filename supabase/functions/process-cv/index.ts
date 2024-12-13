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
    console.log('Starting CV processing...')
    
    // Get the file from FormData
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file || !(file instanceof File)) {
      console.error('No file provided or invalid file')
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Received file:', file.name, 'Size:', file.size, 'bytes')

    // Convert file to ArrayBuffer to check if it's a ZIP
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04

    if (isZip) {
      console.log('Processing ZIP file...')
      
      // Mock processing result for ZIP files
      const processedFiles = [
        {
          fileName: 'resume1.pdf',
          status: 'processed',
          score: Math.floor(Math.random() * 30) + 70,
          matchPercentage: Math.floor(Math.random() * 20) + 60
        },
        {
          fileName: 'resume2.pdf',
          status: 'processed',
          score: Math.floor(Math.random() * 30) + 70,
          matchPercentage: Math.floor(Math.random() * 20) + 60
        }
      ]

      console.log('ZIP processing completed:', processedFiles.length, 'files processed')
      
      return new Response(
        JSON.stringify({
          isZip: true,
          processedFiles
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Handle single file
    console.log('Processing single file...')
    
    // Mock processing for single file
    const result = {
      fileName: file.name,
      status: 'processed',
      score: Math.floor(Math.random() * 30) + 70,
      matchPercentage: Math.floor(Math.random() * 20) + 60
    }

    console.log('Single file processing completed')
    
    return new Response(
      JSON.stringify({
        isZip: false,
        processedFiles: [result]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process file',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})