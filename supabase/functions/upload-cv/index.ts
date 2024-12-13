import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { unzip } from "https://deno.land/x/zip@v1.2.5/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const candidateName = formData.get('candidateName')

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file uploaded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle ZIP files
    if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed') {
      const arrayBuffer = await file.arrayBuffer();
      const zipData = new Uint8Array(arrayBuffer);
      const unzippedFiles = await unzip(zipData);
      
      const uploadedFiles = [];
      
      for (const [filename, content] of Object.entries(unzippedFiles)) {
        // Skip directories and non-supported file types
        if (filename.endsWith('/') || 
            !filename.match(/\.(pdf|doc|docx)$/i)) {
          continue;
        }

        const fileExt = filename.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;
        const contentType = fileExt === 'pdf' 
          ? 'application/pdf'
          : fileExt === 'doc'
          ? 'application/msword'
          : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(filePath, content, {
            contentType,
            upsert: false
          });

        if (uploadError) {
          console.error(`Error uploading ${filename}:`, uploadError);
          continue;
        }

        const { error: dbError } = await supabase
          .from('cv_uploads')
          .insert({
            file_name: filename,
            file_path: filePath,
            content_type: contentType,
            file_size: content.length,
            candidate_name: candidateName || null,
          });

        if (dbError) {
          console.error(`Error saving metadata for ${filename}:`, dbError);
          continue;
        }

        uploadedFiles.push({ filename, filePath });
      }

      return new Response(
        JSON.stringify({ 
          message: 'ZIP contents uploaded successfully', 
          files: uploadedFiles 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Handle single file upload
    const fileExt = file.name.split('.').pop()
    const filePath = `${crypto.randomUUID()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const { error: dbError } = await supabase
      .from('cv_uploads')
      .insert({
        file_name: file.name,
        file_path: filePath,
        content_type: file.type,
        file_size: file.size,
        candidate_name: candidateName || null,
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save file metadata', details: dbError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ 
        message: 'CV uploaded successfully', 
        filePath,
        fileName: file.name 
      }),
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