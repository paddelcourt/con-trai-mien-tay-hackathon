import { generateText, embed } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export async function generateAIText(prompt: string, maxOutputTokens: number): Promise<string> {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const { text } = await generateText({
        model: openai('gpt-4.1-nano'),
        prompt,
        maxOutputTokens,
      });
      return text;
    } catch (err) {
      console.warn('OpenAI failed, falling back to Anthropic:', err);
    }
  }

  // Fallback: Anthropic
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No AI provider configured (set OPENAI_API_KEY or ANTHROPIC_API_KEY)');

  const anthropic = createAnthropic({ apiKey });
  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt,
    maxOutputTokens,
  });
  return text;
}

export async function embedText(text: string): Promise<number[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}
