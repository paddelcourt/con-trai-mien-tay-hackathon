-- =====================================================
-- Multiplayer Schema for "Guess the Prompt" Game
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MP_PLAYERS - Players in the multiplayer lobby
-- =====================================================
CREATE TABLE IF NOT EXISTS mp_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'OTHER',
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'challenged', 'in_game')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching online players
CREATE INDEX IF NOT EXISTS idx_mp_players_updated_at ON mp_players(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mp_players_status ON mp_players(status);

-- =====================================================
-- 2. MP_CHALLENGES - Challenge invitations
-- =====================================================
CREATE TABLE IF NOT EXISTS mp_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  challenger_id UUID NOT NULL REFERENCES mp_players(id) ON DELETE CASCADE,
  challenged_id UUID NOT NULL REFERENCES mp_players(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching challenges by player
CREATE INDEX IF NOT EXISTS idx_mp_challenges_challenger ON mp_challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_mp_challenges_challenged ON mp_challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_mp_challenges_status ON mp_challenges(status);

-- =====================================================
-- 3. MP_GAMES - Multiplayer game sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS mp_games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player1_id UUID NOT NULL,
  player2_id UUID NOT NULL,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  player1_country TEXT NOT NULL DEFAULT 'OTHER',
  player2_country TEXT NOT NULL DEFAULT 'OTHER',
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  current_round INTEGER NOT NULL DEFAULT 1,
  total_rounds INTEGER NOT NULL DEFAULT 5,
  current_round_id UUID,
  phase TEXT NOT NULL DEFAULT 'waiting' CHECK (phase IN ('waiting', 'playing', 'round_over', 'game_over')),
  round_winner_id UUID,
  winner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for game queries
CREATE INDEX IF NOT EXISTS idx_mp_games_player1 ON mp_games(player1_id);
CREATE INDEX IF NOT EXISTS idx_mp_games_player2 ON mp_games(player2_id);
CREATE INDEX IF NOT EXISTS idx_mp_games_phase ON mp_games(phase);

-- =====================================================
-- 4. MP_ROUND_GUESSES - Player guesses per round
-- =====================================================
CREATE TABLE IF NOT EXISTS mp_round_guesses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES mp_games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL,
  player_name TEXT NOT NULL,
  round_num INTEGER NOT NULL,
  guess TEXT NOT NULL,
  score INTEGER,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  feedback TEXT,
  hint TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for guess queries
CREATE INDEX IF NOT EXISTS idx_mp_round_guesses_game ON mp_round_guesses(game_id);
CREATE INDEX IF NOT EXISTS idx_mp_round_guesses_player ON mp_round_guesses(player_id);
CREATE INDEX IF NOT EXISTS idx_mp_round_guesses_round ON mp_round_guesses(game_id, round_num);

-- =====================================================
-- 5. ROUNDS table (if not exists) - Used by both solo and multiplayer
-- =====================================================
CREATE TABLE IF NOT EXISTS rounds (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actual_prompt TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. Enable Row Level Security (optional but recommended)
-- =====================================================
-- For now, we'll use service role key which bypasses RLS
-- If you want to enable RLS, uncomment these:

-- ALTER TABLE mp_players ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mp_challenges ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mp_games ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mp_round_guesses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. ENABLE REALTIME for multiplayer tables
-- This is CRITICAL for the real-time subscriptions to work!
-- =====================================================

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create new publication with all multiplayer tables
CREATE PUBLICATION supabase_realtime FOR TABLE
  mp_players,
  mp_challenges,
  mp_games,
  mp_round_guesses;

-- Alternative: If you want to add to existing publication
-- ALTER PUBLICATION supabase_realtime ADD TABLE mp_players;
-- ALTER PUBLICATION supabase_realtime ADD TABLE mp_challenges;
-- ALTER PUBLICATION supabase_realtime ADD TABLE mp_games;
-- ALTER PUBLICATION supabase_realtime ADD TABLE mp_round_guesses;

-- =====================================================
-- 8. Auto-update updated_at timestamp trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to relevant tables
DROP TRIGGER IF EXISTS update_mp_players_updated_at ON mp_players;
CREATE TRIGGER update_mp_players_updated_at
  BEFORE UPDATE ON mp_players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mp_challenges_updated_at ON mp_challenges;
CREATE TRIGGER update_mp_challenges_updated_at
  BEFORE UPDATE ON mp_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mp_games_updated_at ON mp_games;
CREATE TRIGGER update_mp_games_updated_at
  BEFORE UPDATE ON mp_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. Cleanup function for stale players (optional)
-- Run this periodically to remove inactive players
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_stale_mp_players()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM mp_players
  WHERE updated_at < NOW() - INTERVAL '2 minutes'
    AND status = 'idle';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Done! Your multiplayer schema is ready.
-- =====================================================
