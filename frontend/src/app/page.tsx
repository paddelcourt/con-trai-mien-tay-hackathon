'use client';

import { useState, useCallback, useEffect } from 'react';
import { gameRounds, calculateScore, GameRound } from '@/data/gameData';
import Sidebar from '@/components/Sidebar';
import AIMessage from '@/components/AIMessage';
import PromptInput from '@/components/PromptInput';
import RevealSection from '@/components/RevealSection';

type GamePhase = 'playing' | 'revealed' | 'finished';

interface RoundResult {
  round: number;
  guess: string;
  actual: string;
  score: number;
}

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [shuffledRounds, setShuffledRounds] = useState<GameRound[]>([]);

  useEffect(() => {
    const shuffled = [...gameRounds].sort(() => Math.random() - 0.5);
    setShuffledRounds(shuffled);
  }, []);

  const currentRound = shuffledRounds[currentRoundIndex];
  const totalRounds = Math.min(shuffledRounds.length, 5);

  const handleGuessSubmit = useCallback((guess: string) => {
    if (!currentRound) return;

    const score = calculateScore(guess, currentRound.actualPrompt);
    setUserGuess(guess);
    setRoundScore(score);
    setTotalScore((prev) => prev + score);
    setResults((prev) => [
      ...prev,
      {
        round: currentRoundIndex + 1,
        guess,
        actual: currentRound.actualPrompt,
        score,
      },
    ]);
    setPhase('revealed');
  }, [currentRound, currentRoundIndex]);

  const handleNextRound = useCallback(() => {
    if (currentRoundIndex + 1 >= totalRounds) {
      setPhase('finished');
    } else {
      setCurrentRoundIndex((prev) => prev + 1);
      setUserGuess('');
      setPhase('playing');
    }
  }, [currentRoundIndex, totalRounds]);

  const restartGame = useCallback(() => {
    const shuffled = [...gameRounds].sort(() => Math.random() - 0.5);
    setShuffledRounds(shuffled);
    setPhase('playing');
    setCurrentRoundIndex(0);
    setTotalScore(0);
    setResults([]);
    setUserGuess('');
  }, []);

  // Finished Screen
  if (phase === 'finished') {
    const averageScore = Math.round(totalScore / totalRounds);

    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center p-4">
        <div className="max-w-sm md:max-w-md w-full text-center animate-fade-in">
          {/* Score Circle */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-[#10a37f] flex items-center justify-center animate-score-pop">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-[#ececec]">{totalScore}</div>
                <div className="text-xs text-[#8e8e8e]">points</div>
              </div>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-[#ececec] mb-2">Game Complete!</h2>
          <p className="text-sm md:text-base text-[#b4b4b4] mb-4 md:mb-6">
            Average score: {averageScore}% per round
          </p>

          {/* Results */}
          <div className="bg-[#2f2f2f] rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 md:mb-6">
            <div className="space-y-2">
              {results.map((result, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#212121]"
                >
                  <span className="text-sm text-[#b4b4b4]">Round {result.round}</span>
                  <span
                    className="font-semibold text-sm"
                    style={{
                      color:
                        result.score >= 70 ? '#10b981' :
                        result.score >= 40 ? '#f59e0b' : '#ef4444',
                    }}
                  >
                    {result.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Play Again */}
          <button
            onClick={restartGame}
            className="w-full py-3 md:py-4 rounded-full bg-[#10a37f] hover:bg-[#1a7f64] text-white font-medium transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Main Game Screen - ChatGPT Layout
  return (
    <div className="min-h-screen bg-[#212121] flex">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          currentRound={currentRoundIndex + 1}
          totalRounds={totalRounds}
          totalScore={totalScore}
          onNewGame={restartGame}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#383838]">
          {/* Mobile: Show score */}
          <div className="flex items-center gap-4 md:hidden">
            <span className="text-sm text-[#10a37f] font-medium">{totalScore} pts</span>
          </div>

          <span className="text-sm text-[#b4b4b4] flex-1 text-center">
            Round {currentRoundIndex + 1} of {totalRounds}
          </span>

          {/* Mobile: New game button */}
          <button
            onClick={restartGame}
            className="md:hidden text-sm text-[#8e8e8e] hover:text-[#ececec]"
          >
            New
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pb-32">
          {/* Mystery Prompt Placeholder - User message position */}
          {phase === 'playing' && (
            <div className="py-4 md:py-6 animate-fade-in">
              <div className="max-w-3xl mx-auto px-4">
                <div className="flex justify-end">
                  <div className="bg-[#2f2f2f] rounded-3xl px-4 py-2.5 md:px-5 md:py-3 max-w-[85%] md:max-w-[80%]">
                    <span className="text-[#8e8e8e] italic text-sm md:text-base">???</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentRound && (
            <AIMessage
              key={currentRoundIndex}
              content={currentRound.aiResponse}
              isRevealing={phase === 'revealed'}
            />
          )}

          {phase === 'revealed' && currentRound && (
            <RevealSection
              userGuess={userGuess}
              actualPrompt={currentRound.actualPrompt}
              score={roundScore}
              onNextRound={handleNextRound}
            />
          )}
        </div>

        {/* Input Area - Fixed at bottom */}
        {phase === 'playing' && (
          <div className="fixed bottom-0 left-0 md:left-[260px] right-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-4 pb-4 md:pt-6 md:pb-6">
            <PromptInput
              onSubmit={handleGuessSubmit}
              disabled={phase !== 'playing'}
            />
          </div>
        )}
      </main>
    </div>
  );
}
