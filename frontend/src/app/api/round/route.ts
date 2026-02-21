import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateRound } from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const difficulty = Math.max(1, Math.min(10, parseInt(searchParams.get('difficulty') || '1')));

    const round = await generateRound(difficulty);

    // Save round to database
    const { data, error } = await supabase
      .from('rounds')
      .insert({
        actual_prompt: round.prompt,
        ai_response: round.response,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({
      id: data.id,
      aiResponse: round.response,
    });
  } catch (error) {
    console.error('Error generating round:', error);
    return NextResponse.json(
      { error: 'Failed to generate round' },
      { status: 500 }
    );
  }
}
