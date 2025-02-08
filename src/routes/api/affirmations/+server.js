import { HfInference } from '@huggingface/inference';
import { env } from '$env/dynamic/private';

const hf = new HfInference(env.HUGGINGFACE_API_KEY);

export async function POST({ request }) {
  try {
    const { prompt } = await request.json();
    
    if (!env.HUGGINGFACE_API_KEY) {
      throw new Error('Missing Hugging Face API key');
    }

    const chatCompletion = await hf.chatCompletion({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      messages: [
        {
          role: "user",
          content: `Generate a single inspiring affirmation about: ${prompt}. Use this list as inspiration (You are ready,          Your efforts help you succeed,
          You can make a real difference,
          Your hard work will pay off,
          You are strong,
          You have the power to make the right choices for yourself,
          You have faith in your abilities,
          You got this,
          You are grateful for what you can do,
          You are happy to be you,
          Your goals are achievable,
          You are confident,
          You will be kind to yourself today,
          You are on the right path for you,
          You deserve love in your life,
          You will take action to accomplish your goals,
          You will celebrate the progress you’re making to reach your goals,
          You will look for the good in things,
          You are always learning,
          You trust yourself,
          You will try new things,
          You will turn negative thoughts into positive ones,
          You will accept yourself as you are,
          You love yourself,
          You will make time for what brings you joy,
          You are powerful,
          You believe in yourself,
          It’s OK for you to have fun,
          Your possibilities are endless,
          You are well-rested and full of energy,
          You are relaxed and at peace,
          You are strong in mind, body, and spirit,
          Your life is a gift,
          You deserve love and happiness,
          You care for yourself,
          Healthy food fuels your body,
          Today, you will take steps to reach your goals,
          You give yourself room to make mistakes and grow,
          You will find moments of joy today, 
          You embrace your power.).
          If the input makes no sense, tell the user to enter another time, or make a joke about it being unclear. 
          However, your response should be only the affirmation, nothing else, and put it inside quotes. 
          If the prompt is specific, you can also be specific and a little longer than the examples, just make sure you are talking in 2nd person. 
          Format the response as: "<affirmation>"`}
        ],

          provider: "sambanova",
          max_tokens: 50,
          temperature: 0.7,
          top_p: 0.95
        });
          

    if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
      throw new Error('No response generated');
    }

    let generatedText = chatCompletion.choices[0].message.content;

    // Clean up response
    //generatedText = generatedText
    //.replace(/^Response:|^Assistant:|^AI:|^Affirmation:/gi, '')
    //.split(/[.!?\n]/)[0]
    //.trim();
    

    if (!generatedText) {
      throw new Error('Empty response after cleaning');
    }

    console.log('Generated affirmation:', generatedText);

    return new Response(
      JSON.stringify({
        affirmation: generatedText,
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
        error: error.message || 'Failed to generate affirmation'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}