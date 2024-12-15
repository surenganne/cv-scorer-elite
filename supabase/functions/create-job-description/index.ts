import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface JobDescription {
  title: string;
  description: string;
  required_skills: string;
  minimum_experience: number;
  preferred_qualifications?: string;
  experience_weight?: number;
  skills_weight?: number;
  education_weight?: number;
  certifications_weight?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    // Get request body
    const jobData: JobDescription = await req.json()
    console.log('Received job description data:', jobData)

    // Basic validation
    if (!jobData.title || !jobData.description || !jobData.required_skills || !jobData.minimum_experience) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: title, description, required_skills, and minimum_experience are required' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Set default weights if not provided
    const finalJobData = {
      ...jobData,
      experience_weight: jobData.experience_weight ?? 25,
      skills_weight: jobData.skills_weight ?? 25,
      education_weight: jobData.education_weight ?? 25,
      certifications_weight: jobData.certifications_weight ?? 25,
      status: 'active'
    }

    // Insert job description into database
    const { data, error } = await supabaseClient
      .from('job_descriptions')
      .insert([finalJobData])
      .select()
      .single()

    if (error) throw error

    console.log('Successfully created job description:', data)

    return new Response(
      JSON.stringify({ 
        message: 'Job description created successfully', 
        data 
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error creating job description:', error)

    return new Response(
      JSON.stringify({ 
        error: 'Failed to create job description',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})