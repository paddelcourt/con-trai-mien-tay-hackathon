// API routes are now in the same Next.js app
const API_BASE = '';

export interface RoundData {
  id: string;
  aiResponse: string;
}

export interface GuessResult {
  score: number;
  feedback: string;
  hint: string;
  isCorrect: boolean;
  actualPrompt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  country: string;
  score: number;
  rounds_completed?: number;
  total_time_seconds?: number;
}

export interface DatasetEntry {
  id: string;
  username: string;
  actualPrompt: string;
  userGuess: string;
  aiResponse: string;
  score: number;
  timestamp: string;
}

export interface TickerEntry {
  username: string;
  country: string;
  score: number;
  timestamp: string;
}

// Fetch a new round with optional difficulty
export async function fetchRound(difficulty: number = 1): Promise<RoundData> {
  const response = await fetch(`${API_BASE}/api/round?difficulty=${difficulty}`);
  if (!response.ok) {
    throw new Error('Failed to fetch round');
  }
  return response.json();
}

// Submit a guess for judging
export async function submitGuess(
  roundId: string,
  userGuess: string,
  username: string,
  country: string,
  timeSeconds?: number
): Promise<GuessResult> {
  const response = await fetch(`${API_BASE}/api/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roundId,
      userGuess,
      username,
      country,
      timeSeconds,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit guess');
  }
  return response.json();
}

// Save final score to leaderboard
export async function saveToLeaderboard(
  username: string,
  country: string,
  totalScore: number,
  roundsCompleted: number,
  totalTimeSeconds?: number
): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${API_BASE}/api/leaderboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      country,
      totalScore,
      roundsCompleted,
      totalTimeSeconds,
    }),
  });
  if (!response.ok) {
    throw new Error('Failed to save to leaderboard');
  }
  return response.json();
}

// Fetch leaderboard
export async function fetchLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  const response = await fetch(`${API_BASE}/api/leaderboard?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }
  return response.json();
}

// Fetch ticker data (recent scores)
export async function fetchTicker(limit: number = 20): Promise<TickerEntry[]> {
  const response = await fetch(`${API_BASE}/api/ticker?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch ticker');
  }
  return response.json();
}

// Fetch dataset
export async function fetchDataset(limit: number = 100): Promise<DatasetEntry[]> {
  const response = await fetch(`${API_BASE}/api/dataset?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch dataset');
  }
  return response.json();
}

// Health check
export async function checkHealth(): Promise<{ status: string; provider: string }> {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) {
    throw new Error('API health check failed');
  }
  return response.json();
}

// ============================================================
// Multiplayer API helpers
// ============================================================

export interface MpPlayer {
  id: string;
  username: string;
  country: string;
  status: 'idle' | 'challenged' | 'in_game';
  updated_at: string;
}

export interface MpChallenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface MpGame {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_name: string;
  player2_name: string;
  player1_country: string;
  player2_country: string;
  player1_score: number;
  player2_score: number;
  current_round: number;
  total_rounds: number;
  current_round_id: string;
  phase: 'waiting' | 'playing' | 'round_over' | 'game_over';
  round_winner_id: string | null;
  winner_id: string | null;
  updated_at: string;
}

export interface MpRoundGuess {
  id: string;
  game_id: string;
  player_id: string;
  player_name: string;
  round_num: number;
  guess: string;
  score: number | null;
  is_correct: boolean;
  feedback: string | null;
  hint: string | null;
  submitted_at: string;
}

export interface MpGuessResult {
  score: number;
  feedback: string;
  hint: string;
  isCorrect: boolean;
  actualPrompt?: string;
}

// Register player in the lobby
export async function registerMpPlayer(
  username: string,
  country: string
): Promise<{ playerId: string }> {
  const response = await fetch(`${API_BASE}/api/multiplayer/player`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, country }),
  });
  if (!response.ok) throw new Error('Failed to register multiplayer player');
  return response.json();
}

// Remove player from lobby
export async function removeMpPlayer(playerId: string): Promise<void> {
  await fetch(`${API_BASE}/api/multiplayer/player`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId }),
  });
}

// Send heartbeat to keep player alive in lobby
export async function sendHeartbeat(playerId: string): Promise<void> {
  await fetch(`${API_BASE}/api/multiplayer/player/${playerId}/heartbeat`, {
    method: 'POST',
  });
}

// Send a challenge to another player
export async function sendChallenge(
  challengerId: string,
  challengedId: string
): Promise<{ challengeId: string }> {
  const response = await fetch(`${API_BASE}/api/multiplayer/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengerId, challengedId }),
  });
  if (!response.ok) throw new Error('Failed to send challenge');
  return response.json();
}

// Accept or reject a challenge
export async function respondToChallenge(
  challengeId: string,
  action: 'accepted' | 'rejected'
): Promise<{ success: boolean; challenge: MpChallenge }> {
  const response = await fetch(`${API_BASE}/api/multiplayer/challenge`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, action }),
  });
  if (!response.ok) throw new Error('Failed to respond to challenge');
  return response.json();
}

// Create a new multiplayer game
export async function createMpGame(
  player1Id: string,
  player2Id: string,
  player1Name: string,
  player2Name: string,
  player1Country: string,
  player2Country: string,
  totalRounds?: number
): Promise<{ gameId: string; aiResponse: string; roundId: string }> {
  const response = await fetch(`${API_BASE}/api/multiplayer/game`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      player1Id, player2Id, player1Name, player2Name,
      player1Country, player2Country, totalRounds,
    }),
  });
  if (!response.ok) throw new Error('Failed to create multiplayer game');
  return response.json();
}

// Submit a guess in a multiplayer game
export async function submitMpGuess(
  gameId: string,
  playerId: string,
  playerName: string,
  guess: string
): Promise<MpGuessResult> {
  const response = await fetch(`${API_BASE}/api/multiplayer/game/${gameId}/guess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, playerName, guess }),
  });
  if (!response.ok) throw new Error('Failed to submit multiplayer guess');
  return response.json();
}

// Signal that a client is ready for the next round (after round_over countdown)
export async function advanceToNextRound(gameId: string): Promise<void> {
  await fetch(`${API_BASE}/api/multiplayer/game/${gameId}/next-round`, {
    method: 'POST',
  });
}
