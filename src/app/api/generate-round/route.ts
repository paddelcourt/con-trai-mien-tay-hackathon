import { NextRequest, NextResponse } from 'next/server';
import { generateAIText } from '@/lib/ai';
import { activeRounds } from '../round-store';

export const runtime = 'nodejs';

interface DifficultyConfig {
  tier: string;
  answerLength: string;
  subjectPool: string;
  clueStyle: string;
  example: string;
}

function getDifficultyConfig(roundNumber: number): DifficultyConfig {
  if (roundNumber <= 2) {
    return {
      tier: 'VERY EASY',
      answerLength: '1–3 words',
      subjectPool: 'Everyday universal things: fire, water, sleep, rain, mirror, shadow, ice, door, bread, sun, moon, clock, wind, snow, dream',
      clueStyle: 'Obvious and literal. Describe physical properties and everyday experiences. Anyone on Earth should get it within seconds.',
      example: `Example:
Question: "What is fire?"
Clue: "It dances without feet and eats without a mouth. It gives warmth and light, but touch it and it punishes you instantly. It has been humanity's companion since the very beginning."`,
    };
  }

  if (roundNumber <= 4) {
    return {
      tier: 'EASY',
      answerLength: '2–4 words',
      subjectPool: 'Famous everyday things: Eiffel Tower, pizza, bicycle, birthday cake, roller coaster, smartphone, elevator, sunglasses, umbrella, refrigerator',
      clueStyle: 'Clear but requires one small mental hop. Describe the thing\'s purpose, feeling, or cultural role without naming it.',
      example: `Example:
Question: "What is a birthday cake?"
Clue: "It appears exactly once a year for each person, always with tiny flames on top that you must extinguish with a single breath. It marks the passing of time in the sweetest possible way. Making a wish is optional but strongly encouraged."`,
    };
  }

  if (roundNumber <= 6) {
    return {
      tier: 'MEDIUM',
      answerLength: '2–5 words',
      subjectPool: 'Things with ironic or indirect qualities: time, gravity, horizon, silence, procrastination, nostalgia, jealousy, a deadline, a habit, luck',
      clueStyle: 'Metaphorical and lateral. Describe the concept through its effects, contradictions, or paradoxes. Requires genuine thinking.',
      example: `Example:
Question: "What is procrastination?"
Clue: "It always promises you can start tomorrow, and somehow tomorrow never argues back. It feels like rest but leaves you more tired than work ever would. The longer you give in to it, the louder it screams when you finally stop."`,
    };
  }

  return {
    tier: 'HARD',
    answerLength: '2–5 words',
    subjectPool: 'Abstract and scientific concepts: entropy, irony, a black hole, the placebo effect, recursion, a blind spot, déjà vu, cognitive dissonance, a paradox, the Dunning-Kruger effect',
    clueStyle: 'Cryptic and clever. Use unexpected angles, wordplay, or philosophical framing. Should make players say "of course!" only after they get it.',
    example: `Example:
Question: "What is a black hole?"
Clue: "It is the universe's most patient collector — it takes everything and returns nothing, not even light. The closer you get, the slower time moves, until time itself forgets how to tick. Scientists can only describe it by the shape of the silence it carves into space."`,
  };
}

export async function POST(req: NextRequest) {
  try {
    let roundNumber = 1;
    try {
      const body = await req.json();
      if (typeof body?.roundNumber === 'number') {
        roundNumber = body.roundNumber;
      }
    } catch {
      // body missing or not JSON — default to round 1
    }

    const config = getDifficultyConfig(roundNumber);

    const text = await generateAIText(
      `You are designing a PUZZLE round for a "Guess The Prompt" game. Players read your CLUE and must guess the original QUESTION/ANSWER in ${config.answerLength}.

DIFFICULTY: ${config.tier} (Round ${roundNumber})
SUBJECT POOL: ${config.subjectPool}
CLUE STYLE: ${config.clueStyle}

RULES:
- Pick one subject from the subject pool above.
- The answer (the thing being described) must be ${config.answerLength} long.
- Write a 3-sentence clue that reads like a riddle, NOT a Wikipedia article.
- The clue must start with "It" or "They".
- The clue must NEVER contain the answer word(s) — not even once.
- The clue must give enough information to guess correctly, but not make it trivial.

${config.example}

Return ONLY valid JSON with no other text:
{"question": "What is [the answer]?", "answer": "[The 3-sentence riddle-style clue]"}`,
      512,
    );

    const parsed = JSON.parse(text.trim());
    const { question, answer } = parsed;

    if (!question || !answer) {
      throw new Error('Invalid response structure');
    }

    const roundId = crypto.randomUUID();
    activeRounds.set(roundId, question);

    // Clean up old rounds (keep last 100)
    if (activeRounds.size > 100) {
      const firstKey = activeRounds.keys().next().value;
      if (firstKey) activeRounds.delete(firstKey);
    }

    return NextResponse.json({ roundId, aiResponse: answer });
  } catch (error) {
    console.error('Generate round error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate round';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
