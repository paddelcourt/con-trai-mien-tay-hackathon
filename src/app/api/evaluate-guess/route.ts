import { NextRequest, NextResponse } from 'next/server';
import { generateAIText, embedText, cosineSimilarity } from '@/lib/ai';
import { activeRounds } from '../round-store';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { roundId, userGuess, guessNumber } = await req.json();

    if (!roundId || !userGuess) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const actualQuestion = activeRounds.get(roundId);
    if (!actualQuestion) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    let score: number;
    let feedback: string;

    const [embedActual, embedGuess] = await Promise.all([
      embedText(actualQuestion),
      embedText(userGuess),
    ]);

    if (embedActual && embedGuess) {
      // Embedding-based scoring
      score = Math.round(cosineSimilarity(embedActual, embedGuess) * 100);
      const feedbackText = await generateAIText(
        `You are giving feedback in a hot-cold reverse-guessing game.
Actual question: "${actualQuestion}"
Player's guess: "${userGuess}"
Score: ${score}/100

Provide a short encouraging feedback (max 12 words) WITHOUT revealing the actual question. Use temperature language (freezing/cold/warm/hot/burning/boiling).
Return ONLY valid JSON: {"feedback": "..."}`,
        100,
      );
      ({ feedback } = JSON.parse(feedbackText.trim()));
    } else {
      // Fallback: LLM-based scoring
      const text = await generateAIText(
        `You are scoring a player's guess in a hot-cold reverse-guessing game.

Actual question: "${actualQuestion}"
Player's guess: "${userGuess}"

Score the player's guess from 0 to 100 based on semantic similarity:
- 100: Essentially identical meaning (exact or near-exact match)
- 80-99: Very close, captures the main concept and key details
- 60-79: Correct general topic but missing specifics
- 40-59: Related to the topic but significantly different angle
- 20-39: Tangentially related
- 0-19: Completely different

Provide a short encouraging feedback (max 12 words) WITHOUT revealing the actual question. Use temperature language (freezing/cold/warm/hot/burning/boiling).

Return ONLY valid JSON:
{"score": 85, "feedback": "Getting warmer! You're on the right track!"}`,
        200,
      );
      ({ score, feedback } = JSON.parse(text.trim()));
    }

    const isWon = score >= 90;
    const isGameOver = guessNumber >= 10;
    const shouldReveal = isWon || isGameOver;

    return NextResponse.json({
      score,
      feedback,
      actualQuestion: shouldReveal ? actualQuestion : undefined,
    });
  } catch (error) {
    console.error('Evaluate guess error:', error);
    const message = error instanceof Error ? error.message : 'Failed to evaluate guess';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
