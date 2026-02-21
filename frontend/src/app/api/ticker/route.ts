import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const { data, error } = await supabase
      .from('leaderboard')
      .select('username, country, total_score, rounds_completed, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const entries = data.map((entry) => ({
      username: entry.username,
      country: entry.country,
      score: entry.total_score,
      roundsCompleted: entry.rounds_completed,
      timestamp: entry.created_at,
    }));

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching ticker:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticker' },
      { status: 500 }
    );
  }
}
