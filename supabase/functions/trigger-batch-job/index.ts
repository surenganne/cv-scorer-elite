import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BATCH_API_URL = "https://q6iagsh8w1.execute-api.ap-south-2.amazonaws.com/dev/triggerBatchJob"

serve(async (req) => {
  try {
    const response = await fetch(BATCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        INGESTION_TYPE: "full"
      })
    });

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500 
      },
    )
  }
})