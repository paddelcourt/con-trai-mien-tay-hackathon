import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    model: process.env.AI_MODEL || 'openai/gpt-4.1-nano'
  });
}
