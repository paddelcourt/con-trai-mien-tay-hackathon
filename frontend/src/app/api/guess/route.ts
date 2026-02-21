import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { judgeGuess } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { roundId, userGuess, username, country, timeSeconds } = await request.json();

    // Get the round from database
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', roundId)
      .single();

    if (roundError || !round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    // Judge the guess using AI
    const result = await judgeGuess(userGuess, round.actual_prompt);

    // Save the score
    const { error: scoreError } = await supabase
      .from('scores')
      .insert({
        username,
        country,
        round_id: roundId,
        user_guess: userGuess,
        actual_prompt: round.actual_prompt,
        ai_response: round.ai_response,
        score: result.score,
        time_seconds: timeSeconds || null,
      });

    if (scoreError) {
      console.error('Error saving score:', scoreError);
    }

    return NextResponse.json({
      score: result.score,
      feedback: result.feedback,
      hint: result.hint,
      isCorrect: result.isCorrect,
      actualPrompt: result.isCorrect ? round.actual_prompt : undefined,
    });
  } catch (error) {
    console.error('Error judging guess:', error);
    return NextResponse.json(
      { error: 'Failed to judge guess' },
      { status: 500 }
    );
  }
}
