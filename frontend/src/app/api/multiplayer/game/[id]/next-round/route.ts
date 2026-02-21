import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Transition from round_over to playing (called by client after countdown)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;

    // Get the current game state
    const { data: game, error: gameError } = await supabase
      .from('mp_games')
      .select('phase')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.phase !== 'round_over') {
      return NextResponse.json({ error: 'Game is not in round_over phase' }, { status: 400 });
    }

    // Transition to playing
    await supabase
      .from('mp_games')
      .update({
        phase: 'playing',
        round_winner_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gameId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in next-round POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
