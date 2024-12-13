import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const fileData = await req.blob()
    console.log('Received file size:', fileData.size, 'bytes')
    
    if (!fileData || fileData.size === 0) {
      console.error('No file provided')
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check if it's a ZIP file by magic numbers
    const arrayBuffer = await fileData.arrayBuffer()
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
      fileName: 'document',
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