import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);

    const { data, error } = await supabase
      .from('scores')
      .select('id, username, actual_prompt, user_guess, ai_response, score, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const entries = data.map((entry) => ({
      id: entry.id,
      username: entry.username,
      actualPrompt: entry.actual_prompt,
      userGuess: entry.user_guess,
      aiResponse: entry.ai_response,
      score: entry.score,
      timestamp: entry.created_at,
    }));

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}
