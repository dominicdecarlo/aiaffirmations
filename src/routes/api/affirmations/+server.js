import { env } from '$env/dynamic/private';

export async function POST({ request }) {
  try {
    const { prompt } = await request.json();
    
    if (!env.GEMINI_API_KEY) {
      throw new Error('Missing Gemini API key');
    }

    const systemPrompt = `Generate a single inspiring affirmation about: ${prompt}. Use this list as inspiration (You are ready,          Your efforts help you succeed,
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
          Format the response as: "<affirmation>"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 100,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content?.parts?.[0]?.text) {
      throw new Error('No response generated from Gemini');
    }

    let generatedText = data.candidates[0].content.parts[0].text.trim();

    // Clean up response - remove quotes if present
    generatedText = generatedText.replace(/^["']|["']$/g, '');
    

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