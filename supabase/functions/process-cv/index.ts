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
    
    // Get the file data from the request
    const file = await req.blob();
    console.log('Received file size:', file.size, 'bytes')
    
    if (!file || file.size === 0) {
      console.error('No file provided')
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Convert blob to array buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // Check if it's a ZIP file by magic numbers
    const isZip = fileData[0] === 0x50 && fileData[1] === 0x4B && fileData[2] === 0x03 && fileData[3] === 0x04;

    if (isZip) {
      console.log('Processing ZIP file...')
      try {
        const unzippedFiles = await unzip(fileData);
        const processedFiles = [];

        for (const [filename, content] of Object.entries(unzippedFiles)) {
          // Skip directories and non-supported files
          if (filename.endsWith('/') || !filename.match(/\.(pdf|doc|docx)$/i)) {
            continue;
          }

          console.log('Processing file from ZIP:', filename)
          
          // Mock processing result
          const result = {
            fileName: filename,
            status: 'processed',
            score: Math.floor(Math.random() * 30) + 70,
            matchPercentage: Math.floor(Math.random() * 20) + 60
          };
          
          processedFiles.push(result);
        }

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
      } catch (error) {
        console.error('ZIP processing error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to process ZIP file' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    // Handle single file
    console.log('Processing single file...')
    
    // Mock processing for single file
    const result = {
      fileName: 'document',
      status: 'processed',
      score: Math.floor(Math.random() * 30) + 70,
      matchPercentage: Math.floor(Math.random() * 20) + 60
    };

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