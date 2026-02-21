import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Register a player in the lobby
export async function POST(request: NextRequest) {
  try {
    const { username, country } = await request.json();

    if (!username || !country) {
      return NextResponse.json({ error: 'Username and country required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('mp_players')
      .insert({ username, country, status: 'idle' })
      .select('id')
      .single();

    if (error) {
      console.error('Error registering player:', error);
      return NextResponse.json({ error: 'Failed to register player' }, { status: 500 });
    }

    return NextResponse.json({ playerId: data.id });
  } catch (error) {
    console.error('Error in player POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove player from lobby
export async function DELETE(request: NextRequest) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'playerId required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('mp_players')
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error('Error removing player:', error);
      return NextResponse.json({ error: 'Failed to remove player' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in player DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
