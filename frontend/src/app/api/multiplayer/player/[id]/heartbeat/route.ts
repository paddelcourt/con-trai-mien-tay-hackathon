import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Update player's last-seen timestamp (keep-alive heartbeat)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('mp_players')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating heartbeat:', error);
      return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in heartbeat POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
