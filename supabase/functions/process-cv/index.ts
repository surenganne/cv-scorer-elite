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
    
    // Get the raw body instead of using formData
    const body = await req.blob();
    console.log('Request body size:', body.size);

    if (!body || body.size === 0) {
      console.error('No file provided or empty request')
      return new Response(
        JSON.stringify({ error: 'No file uploaded or invalid file' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Convert blob to array buffer for processing
    const arrayBuffer = await body.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Check if it's a ZIP file by looking at magic numbers
    const isZip = fileData[0] === 0x50 && fileData[1] === 0x4B && fileData[2] === 0x03 && fileData[3] === 0x04;

    if (isZip) {
      console.log('ZIP file detected, extracting contents...')
      
      try {
        const unzippedFiles = await unzip(fileData);
        const processedFiles = [];

        for (const [filename, content] of Object.entries(unzippedFiles)) {
          // Skip directories and non-supported file types
          if (filename.endsWith('/') || 
              !filename.match(/\.(pdf|doc|docx)$/i)) {
            continue;
          }

          console.log('Processing extracted file:', filename);

          // Mock processing for each file
          const processedResult = {
            fileName: filename,
            status: 'processed',
            score: Math.floor(Math.random() * 30) + 70,
            matchPercentage: Math.floor(Math.random() * 20) + 60
          }

          processedFiles.push(processedResult);
        }

        console.log('ZIP processing completed, processed files:', processedFiles.length);

        return new Response(
          JSON.stringify({ 
            isZip: true,
            processedFiles,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } catch (zipError) {
        console.error('Error processing ZIP file:', zipError);
        return new Response(
          JSON.stringify({ error: 'Failed to process ZIP file', details: zipError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }
    }

    // Handle single file
    console.log('Processing single file');
    
    // Mock processing result for single file
    const processedResult = {
      fileName: 'document',
      status: 'processed',
      score: Math.floor(Math.random() * 30) + 70,
      matchPercentage: Math.floor(Math.random() * 20) + 60
    }

    console.log('Single file processing completed:', processedResult);

    return new Response(
      JSON.stringify({ 
        isZip: false,
        processedFiles: [processedResult]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process CV', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})