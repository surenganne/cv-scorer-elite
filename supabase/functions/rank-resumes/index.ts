import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, description, required_skills, preferred_qualifications, experience_weight, skills_weight, education_weight, certifications_weight, job_id } = await req.json()

    const response = await fetch('https://3ltge7zfy7j26bdyygdwlcrtse0rcixl.lambda-url.ap-south-1.on.aws/rank-resumes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        required_skills,
        preferred_qualifications,
        experience_weight,
        skills_weight,
        education_weight,
        certifications_weight,
        job_id
      })
    })

    const data = await response.json()
    
    console.log('Resume ranking response:', data)
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error ranking resumes:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})