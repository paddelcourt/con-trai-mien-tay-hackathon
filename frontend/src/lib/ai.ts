import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';

// Model selection - can be changed via env
const MODEL = process.env.AI_MODEL || 'openai/gpt-4.1-nano';

function getModel() {
  return gateway(MODEL);
}

interface GeneratedRound {
  prompt: string;
  response: string;
  difficulty: number;
}

interface JudgeResult {
  score: number;
  feedback: string;
  hint: string;
  isCorrect: boolean;
}

// Difficulty descriptions for progressive challenge - FASTER ramp up
const difficultyDescriptions: Record<number, string> = {
  1: `EASY: Simple "What is" questions about common things. Examples: "What is a dog?", "What is pizza?", "What is the sun?"`,
  2: `EASY: Basic "How to" or "Explain" questions. Examples: "How do you make toast?", "Explain what a bicycle is", "Why is the sky blue?"`,
  3: `MEDIUM: Opinion or advice questions. Examples: "What's your favorite color and why?", "Give me tips for waking up early", "What's a good movie to watch?"`,
  4: `MEDIUM: Fun questions with personality. Examples: "Tell me a joke", "What's the best pizza topping?", "Give me excuses to skip the gym"`,
  5: `MEDIUM-HARD: Creative twists and comparisons. Examples: "Explain WiFi to a grandma", "Describe coffee like a poet", "Compare cats and dogs"`,
  6: `HARD: Roleplay and creative writing. Examples: "Write a breakup text from Netflix", "Review water like a food critic", "Explain memes to Shakespeare"`,
  7: `HARD: Abstract concepts and unusual perspectives. Examples: "Write a letter from Monday to Friday", "Describe time to an alien", "What would colors say if they could talk?"`,
  8: `EXPERT: Complex roleplay. Examples: "Write a resignation letter from the letter 'E'", "Interview a cloud", "Write a Yelp review of your dreams"`,
  9: `EXPERT: Maximum creativity. Niche references, layered humor, meta-prompts. Examples: "Write an apology from autocorrect", "Explain the internet to a medieval knight"`,
  10: `MASTER: Impossible mode. Obscure, abstract, multi-layered prompts that require real inference. Wild creative scenarios.`,
};

// Generate a new question/response pair with difficulty
export async function generateRound(difficulty: number = 1): Promise<GeneratedRound> {
  const clampedDifficulty = Math.max(1, Math.min(10, difficulty));
  const difficultyDesc = difficultyDescriptions[clampedDifficulty] || difficultyDescriptions[5];

  // Random topic categories to ensure variety
  const topicCategories = [
    'animals (dog, cat, elephant, bird, fish, horse, lion, butterfly)',
    'food (pizza, ice cream, sushi, tacos, bread, cheese, soup, salad)',
    'nature (rain, sun, mountains, ocean, trees, flowers, snow, wind)',
    'technology (phone, computer, internet, TV, car, airplane, robot)',
    'activities (swimming, reading, cooking, dancing, sleeping, running)',
    'places (school, hospital, beach, park, library, museum, zoo)',
    'objects (chair, book, clock, mirror, umbrella, bicycle, shoes)',
    'concepts (friendship, love, happiness, time, music, art, dreams)',
  ];
  const randomCategory = topicCategories[Math.floor(Math.random() * topicCategories.length)];

  const { text } = await generateText({
    model: getModel(),
    prompt: `Generate a prompt and response for "Guess the Prompt" game.

DIFFICULTY ${clampedDifficulty}/10:
${difficultyDesc}

IMPORTANT - VARIETY:
- Pick a topic from this category: ${randomCategory}
- Be creative and pick something DIFFERENT each time
- DO NOT use bananas, apples, or overly common fruits repeatedly

RULES BY DIFFICULTY:
${clampedDifficulty <= 2 ? `- MUST use simple formats: "What is X?", "Explain X", "How do you X?"
- Topics MUST be super common everyday things
- Response should DIRECTLY and OBVIOUSLY answer the question
- Make it VERY easy to guess - the topic should be mentioned clearly in the response` :
clampedDifficulty <= 4 ? `- Can use opinion questions, simple advice, jokes, or fun perspectives
- Topics should be common and relatable
- Response should clearly mention the main topic but can have personality` :
clampedDifficulty <= 6 ? `- Use creative formats: roleplay, unusual perspectives, creative writing
- Can use humor, comparisons, or character voices
- Response should have clear clues but require some thinking` :
`- Maximum creativity: abstract concepts, meta-prompts, niche references
- Can be layered humor or require real inference
- Response should have enough clues to figure it out, but it's meant to be challenging`}

- Prompts should be SHORT (under 15 words)
- Response should be 1-3 short paragraphs MAX

CRITICAL - IMMERSION RULES:
- NEVER mention the game or that it's a game
- NEVER say "Can you guess the prompt?" or anything similar
- NEVER list "Clues:" or hint at what the prompt is
- Respond NATURALLY as if genuinely answering the prompt

Return ONLY valid JSON:
{
  "prompt": "the prompt (under 15 words)",
  "response": "natural response that answers the prompt"
}`,
  });

  try {
    const parsed = JSON.parse(text);
    return {
      prompt: parsed.prompt,
      response: parsed.response,
      difficulty: clampedDifficulty,
    };
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        prompt: parsed.prompt,
        response: parsed.response,
        difficulty: clampedDifficulty,
      };
    }
    throw new Error('Failed to parse AI response');
  }
}

// Judge if the user's guess is close to the actual prompt
export async function judgeGuess(
  userGuess: string,
  actualPrompt: string,
): Promise<JudgeResult> {
  const { text } = await generateText({
    model: getModel(),
    prompt: `You are judging a "Guess the Prompt" game. Be VERY GENEROUS with scoring.

ACTUAL PROMPT: "${actualPrompt}"
USER'S GUESS: "${userGuess}"

Score 0-100 based on semantic similarity - BE LENIENT:
- 60-100: CORRECT! If they got the main topic/subject right, even with different wording
- 40-59: Close, got part of it right
- 20-39: On the right track, related topic
- 0-19: Wrong direction

BE VERY GENEROUS:
- If they mention the same TOPIC, give 60+ (correct)
- "What is a dog" = "Tell me about dogs" = "Explain dogs" = ALL CORRECT (60+)
- Focus on the SUBJECT matter, not exact wording
- Partial matches should score higher than you think

Give a HELPFUL hint that guides the user closer:
- If they got the topic wrong: hint at the actual subject (e.g., "It's about food, not animals")
- If they got the format wrong: hint at how to phrase it (e.g., "Try asking 'What is...'")
- If they're close: tell them what's missing (e.g., "You got the topic, but what kind of question?")

Return ONLY valid JSON:
{
  "score": <0-100>,
  "feedback": "<warmer/colder, 2-3 words>",
  "hint": "<helpful hint that guides toward the answer>",
  "isCorrect": <true if score >= 60>
}`,
  });

  try {
    const parsed = JSON.parse(text);
    return {
      score: parsed.score,
      feedback: parsed.feedback,
      hint: parsed.hint || '',
      isCorrect: parsed.isCorrect ?? parsed.score >= 60,
    };
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: parsed.score,
        feedback: parsed.feedback,
        hint: parsed.hint || '',
        isCorrect: parsed.isCorrect ?? parsed.score >= 60,
      };
    }
    throw new Error('Failed to parse judge response');
  }
}
