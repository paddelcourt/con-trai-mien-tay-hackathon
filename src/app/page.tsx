'use client';

import { useState, useRef, useEffect } from 'react';
import { GameRound, GuessResult, CompletedRound } from '@/lib/types';
import AIMessage from '@/components/AIMessage';
import GuessMessage from '@/components/GuessMessage';
import PromptInput from '@/components/PromptInput';
import Sidebar from '@/components/Sidebar';
import RoundWonOverlay from '@/components/RoundWonOverlay';
import GameLostAnimation from '@/components/GameLostAnimation';
import ScoreSubmitModal from '@/components/ScoreSubmitModal';
import LeaderboardModal from '@/components/LeaderboardModal';

type GamePhase = 'idle' | 'playing' | 'round-won' | 'game-lost' | 'submit-score';

export default function Home() {
  // Phase & round data
  const [gamePhase, setGamePhase] = useState<GamePhase>('idle');
  const [currentRound, setCurrentRound] = useState<GameRound | null>(null);
  const [currentGuesses, setCurrentGuesses] = useState<GuessResult[]>([]);
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(0);
  const [roundStartSeconds, setRoundStartSeconds] = useState(0);

  // Tallies
  const [totalGuesses, setTotalGuesses] = useState(0);

  // UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedLeaderboardId, setSubmittedLeaderboardId] = useState<number | null>(null);
  const [gameLostQuestion, setGameLostQuestion] = useState<string | undefined>();

  // Scroll
  const bottomRef = useRef<HTMLDivElement>(null);

  // Timer effect — runs during playing and round-won
  useEffect(() => {
    if (gamePhase !== 'playing' && gamePhase !== 'round-won') return;
    const id = setInterval(() => {
      setTimerSeconds((prev) => {
        timerRef.current = prev + 1;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [gamePhase]);

  // Auto-scroll effect
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentGuesses]);

  async function startNewRound(startSeconds: number, roundNumber: number) {
    setCurrentRound(null);
    setCurrentGuesses([]);
    setRoundStartSeconds(startSeconds);
    setGamePhase('playing');
    setIsLoading(true);

    try {
      const res = await fetch('/api/generate-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundNumber }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCurrentRound(data as GameRound);
    } catch {
      setGamePhase('idle');
    } finally {
      setIsLoading(false);
    }
  }

  function startGame() {
    setCompletedRounds([]);
    setTotalGuesses(0);
    setTimerSeconds(0);
    timerRef.current = 0;
    setGameLostQuestion(undefined);
    setSubmittedLeaderboardId(null);
    startNewRound(0, 1);
  }

  async function handleGuess(guess: string) {
    if (!currentRound) return;
    const guessNumber = currentGuesses.length + 1;
    const timestamp = Date.now();

    // Show the user's guess immediately as a pending entry
    const pendingResult: GuessResult = { guess, score: 0, feedback: '', timestamp, pending: true };
    setCurrentGuesses((prev) => [...prev, pendingResult]);

    try {
      const res = await fetch('/api/evaluate-guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundId: currentRound.roundId, userGuess: guess, guessNumber }),
      });
      const data = await res.json();
      if (data.error) {
        setCurrentGuesses((prev) => prev.filter((g) => g.timestamp !== timestamp));
        return;
      }

      const result: GuessResult = {
        guess,
        score: data.score,
        feedback: data.feedback,
        timestamp,
      };

      // Replace the pending entry with the real result
      setCurrentGuesses((prev) => prev.map((g) => (g.timestamp === timestamp ? result : g)));
      setTotalGuesses((prev) => prev + 1);

      if (data.score >= 90) {
        const timeTaken = timerRef.current - roundStartSeconds;
        const completedRound: CompletedRound = {
          roundNumber: completedRounds.length + 1,
          guesses: [...currentGuesses, result],
          timeTaken,
          actualQuestion: data.actualQuestion ?? '',
        };
        setCompletedRounds((prev) => [...prev, completedRound]);
        setGamePhase('round-won');
      } else if (guessNumber >= 10) {
        setGameLostQuestion(data.actualQuestion);
        setGamePhase('game-lost');
      }
    } catch {
      // silently ignore network errors
    }
  }

  function handleNextRound() {
    if (gamePhase !== 'round-won') return;
    startNewRound(timerRef.current, completedRounds.length + 1);
  }

  function handleEndGame() {
    setGamePhase('submit-score');
  }

  async function handleSubmitScore(username: string, country: string) {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        country,
        score: totalGuesses * timerRef.current,
        rounds_completed: completedRounds.length,
        total_guesses: totalGuesses,
        total_time: timerRef.current,
      }),
    });
    const data = await res.json();
    setSubmittedLeaderboardId(data.id ?? null);
    setShowLeaderboard(true);
    setGamePhase('idle');
  }

  function handleSkipScore() {
    setShowLeaderboard(true);
    setGamePhase('idle');
  }

  const lastCompletedRound = completedRounds[completedRounds.length - 1];
  const showGameArea = gamePhase !== 'idle' || isLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d0d0d]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        timerSeconds={timerSeconds}
        totalGuesses={totalGuesses}
        completedRounds={completedRounds}
        currentRoundNumber={completedRounds.length + 1}
        onEndGame={handleEndGame}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        gamePhase={gamePhase}
      />

      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'
        }`}
      >
        {/* Welcome screen */}
        {!showGameArea && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-emerald-900/50 animate-float mb-6">
              ?
            </div>

            <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Guess The Prompt</h1>
            <p className="text-white/50 text-base max-w-md mb-8 leading-relaxed">
              An AI has answered a question — but you don&apos;t know what the question was.
              Can you figure it out from the answer?
            </p>

            {/* How-to card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-sm w-full mb-8 text-left">
              <div className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">How to play</div>
              <ul className="flex flex-col gap-2.5">
                {[
                  { icon: '👁️', text: 'Read the AI\'s response carefully' },
                  { icon: '💬', text: 'Type your best guess for the original question' },
                  { icon: '🌡️', text: 'Watch the hot-cold meter to see how close you are' },
                  { icon: '⚡', text: 'Score 90+ to win — you get 10 guesses max' },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="text-base leading-none mt-0.5">{icon}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={startGame}
              className="w-full max-w-sm py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-base transition-colors shadow-lg shadow-emerald-900/40 mb-3"
            >
              Start Game
            </button>

            <button
              onClick={() => setShowLeaderboard(true)}
              className="text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              View Leaderboard
            </button>
          </div>
        )}

        {/* Game area */}
        {showGameArea && (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto py-6 px-4">
                <AIMessage
                  response={currentRound?.aiResponse ?? ''}
                  roundNumber={completedRounds.length + 1}
                  isLoading={isLoading && !currentRound}
                />
                {currentGuesses.map((g, i) => (
                  <GuessMessage
                    key={g.timestamp}
                    guess={g}
                    index={i}
                    isLatest={i === currentGuesses.length - 1}
                    maxGuesses={10}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            </div>

            <PromptInput
              onSubmit={handleGuess}
              disabled={gamePhase !== 'playing' || isLoading || currentGuesses.some((g) => g.pending)}
              isLoading={isLoading || currentGuesses.some((g) => g.pending)}
              guessesLeft={10 - currentGuesses.filter((g) => !g.pending).length}
            />
          </>
        )}
      </main>

      {/* Overlays */}
      {gamePhase === 'round-won' && lastCompletedRound && (
        <RoundWonOverlay
          roundNumber={lastCompletedRound.roundNumber}
          guessCount={lastCompletedRound.guesses.length}
          actualQuestion={lastCompletedRound.actualQuestion}
          onNextRound={handleNextRound}
        />
      )}

      {gamePhase === 'game-lost' && (
        <GameLostAnimation
          completedRounds={completedRounds}
          totalGuesses={totalGuesses}
          timerSeconds={timerSeconds}
          actualQuestion={gameLostQuestion}
          onPlayAgain={startGame}
        />
      )}

      {gamePhase === 'submit-score' && (
        <ScoreSubmitModal
          score={totalGuesses * timerSeconds}
          roundsCompleted={completedRounds.length}
          totalGuesses={totalGuesses}
          totalTime={timerSeconds}
          onSubmit={handleSubmitScore}
          onSkip={handleSkipScore}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => {
            setShowLeaderboard(false);
            setSubmittedLeaderboardId(null);
          }}
          highlightId={submittedLeaderboardId ?? undefined}
        />
      )}
    </div>
  );
}
