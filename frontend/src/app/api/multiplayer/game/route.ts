import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateRound } from '@/lib/ai';

// POST: Create a new multiplayer game (called when challenge is accepted)
export async function POST(request: NextRequest) {
  try {
    const { player1Id, player2Id, player1Name, player2Name, player1Country, player2Country, totalRounds } = await request.json();

    if (!player1Id || !player2Id || !player1Name || !player2Name) {
      return NextResponse.json({ error: 'player1Id, player2Id, player1Name, player2Name required' }, { status: 400 });
    }

    // Generate the first round (difficulty 1 for multiplayer)
    const round = await generateRound(1);

    // Save the round
    const { data: roundData, error: roundError } = await supabase
      .from('rounds')
      .insert({ actual_prompt: round.prompt, ai_response: round.response })
      .select('id')
      .single();

    if (roundError || !roundData) {
      console.error('Error creating round:', roundError);
      return NextResponse.json({ error: 'Failed to generate round' }, { status: 500 });
    }

    // Create the game
    const { data: game, error: gameError } = await supabase
      .from('mp_games')
      .insert({
        player1_id: player1Id,
        player2_id: player2Id,
        player1_name: player1Name,
        player2_name: player2Name,
        player1_country: player1Country || 'OTHER',
        player2_country: player2Country || 'OTHER',
        player1_score: 0,
        player2_score: 0,
        current_round: 1,
        total_rounds: totalRounds || 5,
        current_round_id: roundData.id,
        phase: 'playing',
      })
      .select('id')
      .single();

    if (gameError || !game) {
      console.error('Error creating game:', gameError);
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }

    // Mark both players as in_game
    await supabase
      .from('mp_players')
      .update({ status: 'in_game' })
      .in('id', [player1Id, player2Id]);

    return NextResponse.json({
      gameId: game.id,
      aiResponse: round.response,
      roundId: roundData.id,
    });
  } catch (error) {
    console.error('Error in game POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
