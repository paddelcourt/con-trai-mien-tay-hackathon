import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch the current round's AI response for a game
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;

    const { data: game, error: gameError } = await supabase
      .from('mp_games')
      .select('current_round_id')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('ai_response')
      .eq('id', game.current_round_id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    return NextResponse.json({ aiResponse: round.ai_response });
  } catch (error) {
    console.error('Error in round-info GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
