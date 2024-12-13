import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting CV processing...')
    
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
      
      const zip = new JSZip();
      await zip.loadAsync(arrayBuffer);
      
      const processedFiles = [];
      let totalFiles = 0;
      let processedCount = 0;
      
      // Count total valid files first
      for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (!zipEntry.dir) {
          const extension = filename.split('.').pop()?.toLowerCase();
          if (extension === 'doc' || extension === 'docx' || extension === 'pdf') {
            totalFiles++;
          }
        }
      }
      
      // Process each file in the ZIP
      for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (!zipEntry.dir) {
          const extension = filename.split('.').pop()?.toLowerCase();
          
          if (extension === 'doc' || extension === 'docx' || extension === 'pdf') {
            console.log('Processing file from ZIP:', filename);
            
            try {
              // Get the file content as ArrayBuffer
              const content = await zipEntry.async('arraybuffer');
              
              // Mock processing result with random scores
              // In a real implementation, you would process the actual file content
              processedFiles.push({
                fileName: filename,
                status: 'processed',
                score: Math.floor(Math.random() * 30) + 70,
                matchPercentage: Math.floor(Math.random() * 20) + 60,
                size: content.byteLength // Include the actual file size
              });
              
              processedCount++;
              console.log(`Progress: ${processedCount}/${totalFiles} files (${Math.round((processedCount/totalFiles) * 100)}%)`);
            } catch (error) {
              console.error(`Error processing file ${filename}:`, error);
            }
          }
        }
      }

      console.log('ZIP processing completed:', processedFiles.length, 'files processed');
      
      return new Response(
        JSON.stringify({
          isZip: true,
          processedFiles,
          totalFiles,
          processedCount
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Handle single file
    console.log('Processing single file...');
    
    // Mock processing for single file
    const result = {
      fileName: file.name,
      status: 'processed',
      score: Math.floor(Math.random() * 30) + 70,
      matchPercentage: Math.floor(Math.random() * 20) + 60,
      size: file.size
    };

    console.log('Single file processing completed');
    
    return new Response(
      JSON.stringify({
        isZip: false,
        processedFiles: [result]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process file',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});