export interface GameRound {
  roundId: string;
  aiResponse: string;
}

export interface GuessResult {
  guess: string;
  score: number;
  feedback: string;
  timestamp: number;
  pending?: boolean;
}

export interface CompletedRound {
  roundNumber: number;
  guesses: GuessResult[];
  timeTaken: number;
  actualQuestion: string;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  country: string;
  score: number;
  rounds_completed: number;
  total_guesses: number;
  total_time: number;
  created_at: string;
}
