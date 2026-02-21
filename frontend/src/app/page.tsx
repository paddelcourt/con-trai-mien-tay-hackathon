'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { gameRounds, calculateScore, GameRound } from '@/data/gameData';
import Sidebar, { CompletedRound } from '@/components/Sidebar';
import AIMessage from '@/components/AIMessage';
import PromptInput from '@/components/PromptInput';
import RevealSection from '@/components/RevealSection';
import UsernameModal from '@/components/UsernameModal';
import ScoreTicker from '@/components/ScoreTicker';

type GamePhase = 'playing' | 'revealed';

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [shuffledRounds, setShuffledRounds] = useState<GameRound[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);

  // User info state
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and shuffle rounds
  useEffect(() => {
    const shuffled = [...gameRounds].sort(() => Math.random() - 0.5);
    setShuffledRounds(shuffled);
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  // Get current round, cycling through if we run out
  const currentRound = shuffledRounds.length > 0
    ? shuffledRounds[currentRoundIndex % shuffledRounds.length]
    : null;
  const currentRoundNumber = currentRoundIndex + 1;

  const handleUsernameSubmit = (name: string, selectedCountry: string) => {
    setUsername(name);
    setCountry(selectedCountry);
    setShowUsernameModal(false);
  };

  const handleStartTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const handleGuessSubmit = useCallback((guess: string) => {
    if (!currentRound) return;

    // Auto-start timer on first guess
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    const score = calculateScore(guess, currentRound.actualPrompt);
    setUserGuess(guess);

    // Check if score is high enough (70% threshold)
    if (score >= 70) {
      setRoundScore(score);
      setTotalScore((prev) => prev + score);
      setCompletedRounds((prev) => [
        ...prev,
        {
          roundNumber: currentRoundNumber,
          guess,
          actualPrompt: currentRound.actualPrompt,
          score,
        },
      ]);
      setFeedback(null);
      setPhase('revealed');
    } else {
      // Show error feedback
      if (score >= 40) {
        setFeedback("You're getting closer... Try again!");
      } else if (score >= 20) {
        setFeedback("Not quite right. Keep trying!");
      } else {
        setFeedback("Hmm...that doesn't seem to match. Try again.");
      }
    }
  }, [currentRound, currentRoundNumber, isTimerRunning]);

  const handleNextRound = useCallback(() => {
    setCurrentRoundIndex((prev) => prev + 1);
    setUserGuess('');
    setFeedback(null);
    setPhase('playing');
  }, []);

  const restartGame = useCallback(() => {
    const shuffled = [...gameRounds].sort(() => Math.random() - 0.5);
    setShuffledRounds(shuffled);
    setPhase('playing');
    setCurrentRoundIndex(0);
    setTotalScore(0);
    setCompletedRounds([]);
    setUserGuess('');
    setFeedback(null);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  // Username Modal
  if (showUsernameModal) {
    return <UsernameModal onSubmit={handleUsernameSubmit} />;
  }

  // Main Game Screen - ChatGPT Layout
  return (
    <div className="min-h-screen bg-[#212121] flex flex-col">
      {/* Score Ticker - Hidden on mobile */}
      <div className={`hidden md:block transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[260px]'}`}>
        <ScoreTicker />
      </div>

      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar
            currentRound={currentRoundNumber}
            totalScore={totalScore}
            username={username}
            country={country}
            onNewGame={restartGame}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            timerSeconds={timerSeconds}
            isTimerRunning={isTimerRunning}
            onStartTimer={handleStartTimer}
            completedRounds={completedRounds}
          />
        </div>

        {/* Main Content */}
        <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[260px]'}`}>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto pb-24">
            {/* Mystery Prompt Placeholder / User Guess - User message position */}
            <div className="py-2 md:py-3 animate-fade-in">
              <div className="max-w-3xl mx-auto px-4">
                <div className="flex flex-col items-end">
                  <div className="bg-[#2f2f2f] rounded-2xl px-3 py-2 md:px-4 md:py-2.5 max-w-[85%] md:max-w-[80%]">
                    {userGuess ? (
                      <span className="text-[#ececec] text-[13px] md:text-sm">{userGuess}</span>
                    ) : (
                      <span className="text-[#8e8e8e] italic text-[13px] md:text-sm">???</span>
                    )}
                  </div>
                  {/* Error Feedback - underneath user message */}
                  {feedback && phase === 'playing' && (
                    <div className="flex items-center gap-1.5 text-[#ef4444] text-xs mt-1.5 animate-fade-in">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {feedback}
                    </div>
                  )}
                </div>
              </div>
            </div>

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
            <div className={`fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-3 pb-3 md:pt-4 md:pb-4 transition-all duration-300 ${sidebarCollapsed ? 'md:left-[68px]' : 'md:left-[260px]'}`}>
              <PromptInput
                onSubmit={handleGuessSubmit}
                disabled={phase !== 'playing'}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
