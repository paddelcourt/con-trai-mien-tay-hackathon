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
