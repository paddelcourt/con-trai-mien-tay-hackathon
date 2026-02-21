import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_score', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Add rank to entries
    const entries = data.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      country: entry.country,
      score: entry.total_score,
      rounds_completed: entry.rounds_completed,
      total_time_seconds: entry.total_time_seconds,
    }));

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, country, totalScore, roundsCompleted, totalTimeSeconds } = await request.json();

    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        username,
        country,
        total_score: totalScore,
        rounds_completed: roundsCompleted,
        total_time_seconds: totalTimeSeconds || null,
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Error saving to leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}
