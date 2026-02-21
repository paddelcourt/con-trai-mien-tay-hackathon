import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { LeaderboardEntry } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getDb();

    const top10 = db
      .prepare(
        `SELECT * FROM leaderboard ORDER BY score ASC LIMIT 10`
      )
      .all() as LeaderboardEntry[];

    const all = db
      .prepare(
        `SELECT * FROM leaderboard ORDER BY score ASC`
      )
      .all() as LeaderboardEntry[];

    return NextResponse.json({ top10, all });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username, country, score, rounds_completed, total_guesses, total_time } =
      await req.json();

    if (!username || !country || score === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare(
        `INSERT INTO leaderboard (username, country, score, rounds_completed, total_guesses, total_time)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(username, country, score, rounds_completed, total_guesses, total_time);

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (error) {
    console.error('Leaderboard POST error:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }
}
