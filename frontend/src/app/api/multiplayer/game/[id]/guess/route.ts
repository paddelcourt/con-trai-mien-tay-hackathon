import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { judgeGuess } from '@/lib/ai';
import { generateRound } from '@/lib/ai';

// POST: Submit a guess in a multiplayer round
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
    const { playerId, playerName, guess } = await request.json();

    if (!playerId || !playerName || !guess) {
      return NextResponse.json({ error: 'playerId, playerName, and guess required' }, { status: 400 });
    }

    // Get the current game state
    const { data: game, error: gameError } = await supabase
      .from('mp_games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (game.phase !== 'playing') {
      return NextResponse.json({ error: 'Game is not in playing phase' }, { status: 400 });
    }

    // Get the round to find the actual prompt
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', game.current_round_id)
      .single();

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    // Check if this player already got a correct answer this round
    const { data: existingCorrect } = await supabase
      .from('mp_round_guesses')
      .select('id')
      .eq('game_id', gameId)
      .eq('player_id', playerId)
      .eq('round_num', game.current_round)
      .eq('is_correct', true)
      .single();

    if (existingCorrect) {
      return NextResponse.json({ error: 'Already answered correctly this round' }, { status: 400 });
    }

    // Judge the guess using AI
    const result = await judgeGuess(guess, round.actual_prompt);

    // Insert the guess record
    await supabase
      .from('mp_round_guesses')
      .insert({
        game_id: gameId,
        player_id: playerId,
        player_name: playerName,
        round_num: game.current_round,
        guess,
        score: result.score,
        is_correct: result.isCorrect,
        feedback: result.feedback,
        hint: result.hint,
      });

    // If correct, update scores and check if round/game is over
    if (result.isCorrect) {
      const isPlayer1 = game.player1_id === playerId;
      const scoreField = isPlayer1 ? 'player1_score' : 'player2_score';
      const newScore = (isPlayer1 ? game.player1_score : game.player2_score) + result.score;

      // Check if this is the last round
      const isLastRound = game.current_round >= game.total_rounds;

      if (isLastRound) {
        // Determine overall winner
        const player1FinalScore = isPlayer1 ? newScore : game.player1_score;
        const player2FinalScore = isPlayer1 ? game.player2_score : newScore;
        let winnerId = null;
        if (player1FinalScore > player2FinalScore) winnerId = game.player1_id;
        else if (player2FinalScore > player1FinalScore) winnerId = game.player2_id;

        await supabase
          .from('mp_games')
          .update({
            [scoreField]: newScore,
            phase: 'game_over',
            round_winner_id: playerId,
            winner_id: winnerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gameId);

        // Reset both players to idle
        await supabase
          .from('mp_players')
          .update({ status: 'idle' })
          .in('id', [game.player1_id, game.player2_id]);
      } else {
        // Round over - advance to next round
        const nextRoundNum = game.current_round + 1;

        // Generate the next round
        const nextRound = await generateRound(Math.min(nextRoundNum, 5));
        const { data: nextRoundData } = await supabase
          .from('rounds')
          .insert({ actual_prompt: nextRound.prompt, ai_response: nextRound.response })
          .select('id')
          .single();

        await supabase
          .from('mp_games')
          .update({
            [scoreField]: newScore,
            phase: 'round_over',
            round_winner_id: playerId,
            current_round: nextRoundNum,
            current_round_id: nextRoundData?.id || game.current_round_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gameId);

        // After a short delay, flip to playing phase so both clients see the new round
        // We use a background update via setTimeout equivalent — but since this is serverless,
        // we schedule the transition by setting phase to 'round_over' now.
        // The clients will handle the countdown and then update to 'playing' via next-round API.
      }
    }

    return NextResponse.json({
      score: result.score,
      feedback: result.feedback,
      hint: result.hint,
      isCorrect: result.isCorrect,
      actualPrompt: result.isCorrect ? round.actual_prompt : undefined,
    });
  } catch (error) {
    console.error('Error in multiplayer guess POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
