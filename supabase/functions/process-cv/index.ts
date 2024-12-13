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
      
      // Log all files in the ZIP
      console.log('ZIP contents:');
      for (const filename in zip.files) {
        console.log(`- ${filename} (${zip.files[filename].dir ? 'directory' : 'file'})`);
      }
      
      const processedFiles = [];
      let totalFiles = 0;
      
      // First, count valid files and store them
      const validFiles = [];
      for (const filename in zip.files) {
        const zipEntry = zip.files[filename];
        if (!zipEntry.dir) {
          const extension = filename.split('.').pop()?.toLowerCase();
          console.log(`Checking file: ${filename}, Extension: ${extension}`);
          if (['doc', 'docx', 'pdf'].includes(extension || '')) {
            console.log(`Valid file found: ${filename}`);
            validFiles.push({ filename, zipEntry });
            totalFiles++;
          } else {
            console.log(`Skipping file with invalid extension: ${filename}`);
          }
        } else {
          console.log(`Skipping directory: ${filename}`);
        }
      }
      
      console.log(`Found ${totalFiles} valid files to process in ZIP`);
      
      // Process each valid file
      let processedCount = 0;
      for (const { filename, zipEntry } of validFiles) {
        try {
          console.log(`Processing ${filename} (${processedCount + 1}/${totalFiles})`);
          
          // Get the file content
          const content = await zipEntry.async('uint8array');
          console.log(`File ${filename} content size: ${content.length} bytes`);
          
          // Mock processing result with random scores
          processedFiles.push({
            fileName: filename,
            status: 'processed',
            score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
            matchPercentage: Math.floor(Math.random() * 20) + 60, // Random match between 60-80
            size: content.length
          });
          
          processedCount++;
          console.log(`Processed ${filename} successfully`);
        } catch (error) {
          console.error(`Error processing file ${filename}:`, error);
        }
      }

      console.log(`ZIP processing completed. Processed ${processedCount}/${totalFiles} files`);
      console.log('Processed files:', processedFiles);
      
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
        processedFiles: [result],
        totalFiles: 1,
        processedCount: 1
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