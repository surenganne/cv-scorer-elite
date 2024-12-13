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
    3. A bullet-pointed list of preferred qualifications (education, certifications, or additional skills that would be nice to have)
    
    Job Description: ${jobDescription}
    
    Format your response EXACTLY like this example, maintaining the exact structure and labels:
    REQUIRED_SKILLS: Python, JavaScript, SQL, communication skills, problem-solving
    MINIMUM_EXPERIENCE: 3
    PREFERRED_QUALIFICATIONS:
    • Master's degree in Computer Science or related field
    • AWS certification
    • Experience with cloud computing platforms
    • Knowledge of machine learning frameworks`;

    console.log('Sending request to OpenAI with prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',  // Fixed model name
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional HR assistant that helps create detailed job requirements. Always format your response exactly as requested, maintaining the structure with REQUIRED_SKILLS, MINIMUM_EXPERIENCE, and PREFERRED_QUALIFICATIONS with bullet points.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('Raw content from OpenAI:', content);

    // Parse the response with improved regex patterns
    const requiredSkillsMatch = content.match(/REQUIRED_SKILLS:\s*(.*?)(?=\n|$)/);
    const minimumExperienceMatch = content.match(/MINIMUM_EXPERIENCE:\s*(\d+)/);
    const preferredQualificationsMatch = content.match(/PREFERRED_QUALIFICATIONS:\n((?:•[^\n]*\n?)*)/);

    if (!requiredSkillsMatch || !minimumExperienceMatch) {
      console.error('Failed to parse required fields:', { content, requiredSkillsMatch, minimumExperienceMatch });
      throw new Error('Failed to parse required fields from OpenAI response');
    }

    // Process preferred qualifications with better handling
    let preferredQualifications = '';
    if (preferredQualificationsMatch && preferredQualificationsMatch[1]) {
      preferredQualifications = preferredQualificationsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.trim().substring(1).trim())
        .join('\n');
    }

    console.log('Parsed results:', {
      requiredSkills: requiredSkillsMatch[1],
      minimumExperience: minimumExperienceMatch[1],
      preferredQualifications
    });

    const requirements = {
      requiredSkills: requiredSkillsMatch[1].trim(),
      minimumExperience: parseInt(minimumExperienceMatch[1]),
      preferredQualifications: preferredQualifications.trim(),
    };

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