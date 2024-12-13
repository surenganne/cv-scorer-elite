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

    console.log(`Processing file: ${file.name} (${file.size} bytes)`)

    // Convert file to ArrayBuffer to check if it's a ZIP
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04

    if (isZip) {
      console.log('File identified as ZIP, starting extraction...')
      
      const zip = new JSZip()
      
      try {
        await zip.loadAsync(arrayBuffer)
        console.log('ZIP file loaded successfully')
      } catch (error) {
        console.error('Failed to load ZIP file:', error)
        return new Response(
          JSON.stringify({ error: 'Invalid ZIP file format' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      // Get all files from the ZIP (including those in folders)
      const files = zip.files
      console.log('Files found in ZIP:', Object.keys(files).length)
      
      // Log all files and folders in the ZIP
      for (const [path, entry] of Object.entries(files)) {
        console.log(`Found in ZIP: ${path} (${entry.dir ? 'directory' : 'file'})`)
      }

      const processedFiles = []
      const validFiles = []
      
      // Collect valid files (including those in folders)
      for (const [filename, entry] of Object.entries(files)) {
        if (!entry.dir) { // Skip directories, only process files
          const extension = filename.split('.').pop()?.toLowerCase()
          console.log(`Checking file: ${filename} (Extension: ${extension})`)
          
          if (extension && ['doc', 'docx', 'pdf', 'txt', 'rtf'].includes(extension)) {
            console.log(`✓ Valid file found: ${filename}`)
            validFiles.push({ filename, entry })
          } else {
            console.log(`✗ Invalid extension for file: ${filename}`)
          }
        }
      }
      
      const totalFiles = validFiles.length
      console.log(`Total valid files found: ${totalFiles}`)
      
      if (totalFiles === 0) {
        console.log('No valid files found in ZIP')
        return new Response(
          JSON.stringify({
            isZip: true,
            error: 'No valid files found in ZIP. Supported formats: DOC, DOCX, PDF, TXT, RTF',
            processedFiles: [],
            totalFiles: 0,
            processedCount: 0
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
      
      // Process each valid file
      let processedCount = 0
      for (const { filename, entry } of validFiles) {
        try {
          console.log(`Processing file ${processedCount + 1}/${totalFiles}: ${filename}`)
          
          const content = await entry.async('uint8array')
          if (!content || content.length === 0) {
            console.error(`Empty file content for: ${filename}`)
            continue
          }
          
          console.log(`File content size: ${content.length} bytes`)
          
          // Mock processing result
          processedFiles.push({
            fileName: filename,
            status: 'processed',
            score: Math.floor(Math.random() * 30) + 70,
            matchPercentage: Math.floor(Math.random() * 20) + 60,
            size: content.length
          })
          
          processedCount++
          console.log(`Successfully processed: ${filename}`)
        } catch (error) {
          console.error(`Failed to process ${filename}:`, error)
        }
      }

      console.log(`ZIP processing completed. Processed ${processedCount}/${totalFiles} files`)
      
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
      )
    }

    // Handle single file
    console.log('Processing single file...')
    
    // Mock processing for single file
    const result = {
      fileName: file.name,
      status: 'processed',
      score: Math.floor(Math.random() * 30) + 70,
      matchPercentage: Math.floor(Math.random() * 20) + 60,
      size: file.size
    }

    console.log('Single file processing completed')
    
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