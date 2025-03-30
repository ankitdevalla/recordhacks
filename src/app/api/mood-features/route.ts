import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MoodContext } from '@/app/utils/openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // Note: No NEXT_PUBLIC_ prefix needed here
});

const SYSTEM_PROMPT = `You are an AI music mood classifier. Based on the user's emotional state, weather, calendar status, and comments, return a JSON object with the following structure:

{
  "valence": [min, max],
  "energy": [min, max],
  "tempo": [min, max],
  "acousticness": [min, max],
  "genres": [array of recommended Spotify genres]
}

The valence and energy range from 0 to 1. Tempo is in BPM (60-200). Acousticness ranges from 0 to 1.

IMPORTANT: When the user specifies their preferred genres, you MUST include those exact genres in your response. You may add additional complementary genres, but the user's selected genres must be first in the array. Never override or ignore the user's genre preferences.`;

export async function POST(request: Request) {
  try {
    // Add CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers });
    }

    const context: MoodContext = await request.json();

    // Construct a natural language description of the context
    let prompt = `The user is feeling ${context.mood}`;
    
    if (context.weather) {
      prompt += ` and it's ${context.weather.temperature}°F with ${context.weather.condition} weather`;
    }
    
    if (context.calendar) {
      prompt += context.calendar.isBusy 
        ? `. They are busy with ${context.calendar.eventCount} events today` 
        : `. Their calendar is relatively free today`;
    }
    
    if (context.selectedGenres.length > 0) {
      prompt += `. They prefer ${context.selectedGenres.join(', ')} music`;
    }
    
    if (context.comments) {
      prompt += `. Additional context: ${context.comments}`;
    }

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { 
          status: 500,
          headers
        }
      );
    }

    const features = JSON.parse(response);
    return NextResponse.json(features, { headers });
  } catch (error) {
    console.error('Error in mood-features API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get mood features',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 