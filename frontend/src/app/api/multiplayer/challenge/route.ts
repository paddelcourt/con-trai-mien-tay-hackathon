import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Send a challenge to another player
export async function POST(request: NextRequest) {
  try {
    const { challengerId, challengedId } = await request.json();

    if (!challengerId || !challengedId) {
      return NextResponse.json({ error: 'challengerId and challengedId required' }, { status: 400 });
    }

    // Mark both players as 'challenged'
    await supabase
      .from('mp_players')
      .update({ status: 'challenged' })
      .in('id', [challengerId, challengedId]);

    const { data, error } = await supabase
      .from('mp_challenges')
      .insert({ challenger_id: challengerId, challenged_id: challengedId, status: 'pending' })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
    }

    return NextResponse.json({ challengeId: data.id });
  } catch (error) {
    console.error('Error in challenge POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Accept or reject a challenge
export async function PATCH(request: NextRequest) {
  try {
    const { challengeId, action } = await request.json();

    if (!challengeId || !action || !['accepted', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'challengeId and action (accepted|rejected) required' }, { status: 400 });
    }

    // Get the challenge to find both players
    const { data: challenge, error: fetchError } = await supabase
      .from('mp_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (fetchError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Update challenge status
    await supabase
      .from('mp_challenges')
      .update({ status: action })
      .eq('id', challengeId);

    if (action === 'rejected') {
      // Reset both players to idle
      await supabase
        .from('mp_players')
        .update({ status: 'idle' })
        .in('id', [challenge.challenger_id, challenge.challenged_id]);
    }

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    console.error('Error in challenge PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
