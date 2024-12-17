import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription } = await req.json();

    const prompt = `Based on the following job description, provide:
    1. A comma-separated list of required technical and soft skills
    2. The minimum years of experience recommended
    3. A comma-separated list of preferred qualifications (additional skills, certifications, or experiences that would be beneficial but not required)
    
    Job Description: ${jobDescription}
    
    Format your response exactly like this, keeping the exact labels:
    REQUIRED_SKILLS: skill1, skill2, skill3
    MINIMUM_EXPERIENCE: X
    PREFERRED_QUALIFICATIONS: qualification1, qualification2, qualification3`;

    console.log('Sending request to OpenAI with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional HR assistant that helps create detailed job requirements based on job descriptions.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const data = await response.json();
    console.log('Received response from OpenAI:', data);

    const content = data.choices[0].message.content;
    
    // Parse the response
    const requiredSkillsMatch = content.match(/REQUIRED_SKILLS: (.*)/);
    const minimumExperienceMatch = content.match(/MINIMUM_EXPERIENCE: (\d+)/);
    const preferredQualificationsMatch = content.match(/PREFERRED_QUALIFICATIONS: (.*)/);

    const requirements = {
      requiredSkills: requiredSkillsMatch ? requiredSkillsMatch[1].trim() : '',
      minimumExperience: minimumExperienceMatch ? parseInt(minimumExperienceMatch[1]) : 0,
      preferredQualifications: preferredQualificationsMatch ? preferredQualificationsMatch[1].trim() : '',
    };

    console.log('Parsed requirements:', requirements);

    return new Response(JSON.stringify(requirements), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-requirements function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});