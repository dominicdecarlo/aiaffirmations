import { HfInference } from '@huggingface/inference';
import { env } from '$env/dynamic/private';

// Initialize with API token
if (!env.HUGGINGFACE_API_KEY) {
  console.error('API key is missing from environment');
}

const hf = new HfInference(env.HUGGINGFACE_API_KEY);

export async function POST({ request }) {
  try {
    const { prompt } = await request.json();
    
    if (!env.HUGGINGFACE_API_KEY) {
      throw new Error('Missing Hugging Face API key');
    }

    const response = await hf.textGeneration({
      model: "HuggingFaceH4/zephyr-7b-beta",
      inputs: `You are a supportive AI that provides motivational affirmations. 
              User input: ${prompt}
              Provide a short, motivational response:`,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
      }
    });

    if (!response.generated_text) {
      throw new Error('No response generated');
    }

    return new Response(
      JSON.stringify({
        affirmation: response.generated_text.trim(),
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing affirmation request:', error);
    return new Response(
      JSON.stringify({
        error: 'Authentication failed. Please check your Hugging Face API key.',
      }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
