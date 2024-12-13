import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { unzip } from "https://deno.land/x/zip@v1.2.5/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    })
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

    // Handle ZIP files
    if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
      console.log('ZIP file detected, extracting contents...')
      
      const arrayBuffer = await file.arrayBuffer()
      const zipData = new Uint8Array(arrayBuffer)
      
      try {
        const unzippedFiles = await unzip(zipData)
        const processedFiles = []

        for (const [filename, content] of Object.entries(unzippedFiles)) {
          // Skip directories and non-supported file types
          if (filename.endsWith('/') || 
              !filename.match(/\.(pdf|doc|docx)$/i)) {
            continue
          }

          console.log('Processing extracted file:', filename)

          // Mock processing for each file
          const processedResult = {
            fileName: filename,
            status: 'processed',
            candidateName: `Candidate from ${filename}`, // This would come from actual CV processing
            score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            matchPercentage: Math.floor(Math.random() * 20) + 60 // Random match between 60-80
          }

          processedFiles.push(processedResult)
        }

        console.log('ZIP processing completed, processed files:', processedFiles.length)

        return new Response(
          JSON.stringify({ 
            isZip: true,
            processedFiles,
            originalZipName: file.name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } catch (zipError) {
        console.error('Error processing ZIP file:', zipError)
        return new Response(
          JSON.stringify({ error: 'Failed to process ZIP file', details: zipError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    // Handle single file
    console.log('Processing single file:', file.name)
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock processed result for single file
    const processedResult = {
      fileName: file.name,
      status: 'processed',
      candidateName: 'John Doe', // This would come from actual CV processing
      score: 85, // This would be calculated based on actual CV content
      matchPercentage: 75 // This would be calculated based on job requirements
    }

    console.log('Single file processing completed:', processedResult)

    return new Response(
      JSON.stringify({ 
        isZip: false,
        processedFiles: [processedResult],
        originalFileName: file.name 
      }),
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