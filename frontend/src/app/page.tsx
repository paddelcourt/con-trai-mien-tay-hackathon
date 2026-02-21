'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchRound, submitGuess, saveToLeaderboard, RoundData } from '@/services/api';
import Sidebar, { CompletedRound } from '@/components/Sidebar';
import AIMessage from '@/components/AIMessage';
import PromptInput from '@/components/PromptInput';
import RevealSection from '@/components/RevealSection';
import UsernameModal from '@/components/UsernameModal';
import ScoreTicker from '@/components/ScoreTicker';

type GamePhase = 'playing' | 'revealed' | 'gameover';

const TIME_LIMIT = 120; // 2 minutes

export default function Home() {
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [completedRounds, setCompletedRounds] = useState<CompletedRound[]>([]);

  // Current round data from API
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [difficulty, setDifficulty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User info state
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Timer state - counts DOWN from TIME_LIMIT
  const [timerSeconds, setTimerSeconds] = useState(TIME_LIMIT);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSavedToLeaderboard = useRef(false);

  // Fetch a new round from the API
  const loadNewRound = useCallback(async (diff: number) => {
    setIsLoading(true);
    try {
      const round = await fetchRound(diff);
      setCurrentRound(round);
    } catch (error) {
      console.error('Failed to fetch round:', error);
      // Retry with fallback
      setTimeout(() => loadNewRound(diff), 2000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Track if initial load has happened
  const hasLoadedInitial = useRef(false);

  // Load initial round when game starts (only once)
  useEffect(() => {
    if (!showUsernameModal && phase !== 'gameover' && !hasLoadedInitial.current) {
      hasLoadedInitial.current = true;
      loadNewRound(difficulty);
    }
  }, [showUsernameModal, loadNewRound, difficulty, phase]);

  // Timer effect - counts DOWN from TIME_LIMIT
  useEffect(() => {
    if (isTimerRunning && phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          const newTime = prev - 1;
          // Check if time is up
          if (newTime <= 0) {
            setIsTimerRunning(false);
            setPhase('gameover');
            // Save to leaderboard (only once)
            if (!hasSavedToLeaderboard.current) {
              hasSavedToLeaderboard.current = true;
              saveToLeaderboard(username, country, totalScore, currentRoundIndex, TIME_LIMIT);
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, phase, username, country, totalScore, currentRoundIndex]);

  const currentRoundNumber = currentRoundIndex + 1;
  const timeRemaining = timerSeconds; // Timer now counts down directly

  const handleUsernameSubmit = (name: string, selectedCountry: string) => {
    setUsername(name);
    setCountry(selectedCountry);
    setShowUsernameModal(false);
  };

  const handleStartTimer = useCallback(() => {
    setIsTimerRunning(true);
  }, []);

  const handleGuessSubmit = useCallback(async (guess: string) => {
    if (!currentRound || isSubmitting || phase === 'gameover') return;

    // Auto-start timer on first guess
    if (!isTimerRunning) {
      setIsTimerRunning(true);
    }

    setIsSubmitting(true);
    setUserGuess(guess);

    try {
      const result = await submitGuess(
        currentRound.id,
        guess,
        username,
        country,
        TIME_LIMIT - timerSeconds // Pass elapsed time, not remaining
      );

      if (result.isCorrect) {
        setRoundScore(result.score);
        setTotalScore((prev) => prev + result.score);
        setCompletedRounds((prev) => [
          ...prev,
          {
            roundNumber: currentRoundNumber,
            guess,
            actualPrompt: result.actualPrompt || 'Unknown',
            score: result.score,
          },
        ]);
        setFeedback(null);
        setHint(null);

        // Increase difficulty (max 10) and load next round
        const newDifficulty = Math.min(10, difficulty + 1);
        setDifficulty(newDifficulty);
        setCurrentRoundIndex((prev) => prev + 1);
        setUserGuess('');

        // Load next round
        loadNewRound(newDifficulty);
      } else {
        // Show feedback with hint
        setFeedback(`${result.feedback} (${result.score}%)`);
        setHint(result.hint || null);
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
      setFeedback('Failed to submit guess. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentRound, currentRoundNumber, isTimerRunning, username, country, timerSeconds, isSubmitting, difficulty, loadNewRound, phase]);

  const handleNextRound = useCallback(() => {
    setCurrentRoundIndex((prev) => prev + 1);
    setUserGuess('');
    setFeedback(null);
    setHint(null);
    setPhase('playing');
  }, []);

  const restartGame = useCallback(() => {
    setPhase('playing');
    setCurrentRoundIndex(0);
    setTotalScore(0);
    setCompletedRounds([]);
    setUserGuess('');
    setFeedback(null);
    setHint(null);
    setTimerSeconds(TIME_LIMIT); // Reset to full time
    setIsTimerRunning(false);
    setDifficulty(1);
    hasLoadedInitial.current = false; // Reset so initial load can happen again
    hasSavedToLeaderboard.current = false; // Reset so leaderboard can be saved again
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    loadNewRound(1);
  }, [loadNewRound]);

  // Preview AI response for the modal background
  const previewResponse = `Ah yes, the noble art of horizontal life contemplation. Studies show that the couch develops a gravitational pull directly proportional to how productive you should be.

The classic symptoms include: sudden onset of "just five more minutes," an inexplicable heaviness in all limbs, and the mysterious disappearance of all motivation.

Scientists recommend embracing it fully - resistance is futile anyway.`;

  // Game Over Screen
  if (phase === 'gameover') {
    return (
      <div className="min-h-screen bg-[#212121] flex items-center justify-center p-4">
        <div className="bg-[#2f2f2f] rounded-2xl p-6 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-[#ececec] mb-2">Time&apos;s Up!</h2>
          <p className="text-[#8e8e8e] mb-4">You completed {currentRoundIndex} rounds</p>

          <div className="bg-[#212121] rounded-xl p-4 mb-4">
            <div className="text-3xl font-bold text-[#10a37f] mb-1">{totalScore}</div>
            <div className="text-xs text-[#8e8e8e]">Total Points</div>
          </div>

          <div className="text-sm text-[#8e8e8e] mb-4">
            Highest difficulty reached: {difficulty}/10
          </div>

          <button
            onClick={restartGame}
            className="w-full py-3 rounded-xl bg-[#10a37f] hover:bg-[#1a7f64] text-white font-medium transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Main Game Screen - ChatGPT Layout (always rendered, modal overlays)
  return (
    <div className="min-h-screen bg-[#212121] flex flex-col">
      {/* Username Modal - overlays the preview */}
      {showUsernameModal && <UsernameModal onSubmit={handleUsernameSubmit} />}

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
            {/* Difficulty & Time indicator */}
            <div className="py-2 px-4 flex items-center justify-center gap-3">
              <span className="text-[10px] text-[#8e8e8e] bg-[#2f2f2f] px-2 py-0.5 rounded-full">
                Difficulty: {difficulty}/10
              </span>
              {isTimerRunning && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  timeRemaining <= 30 ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#2f2f2f] text-[#8e8e8e]'
                }`}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} left
                </span>
              )}
            </div>

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
                  {/* Error Feedback with hint */}
                  {feedback && phase === 'playing' && (
                    <div className="flex items-center gap-1.5 text-[#ef4444] text-xs mt-1.5 animate-fade-in">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {feedback}{hint ? ` - ${hint}` : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showUsernameModal ? (
              // Preview for modal background
              <AIMessage
                key="preview"
                content={previewResponse}
                isRevealing={false}
              />
            ) : isLoading ? (
              <div className="py-4 md:py-5">
                <div className="max-w-3xl mx-auto px-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#2f2f2f] flex items-center justify-center flex-shrink-0 animate-pulse">
                      <span className="text-xs text-[#8e8e8e]">AI</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-[#2f2f2f] rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-[#2f2f2f] rounded animate-pulse w-1/2"></div>
                      <div className="h-4 bg-[#2f2f2f] rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentRound && (
              <AIMessage
                key={currentRound.id}
                content={currentRound.aiResponse}
                isRevealing={phase === 'revealed'}
              />
            )}

            {phase === 'revealed' && currentRound && (
              <RevealSection
                userGuess={userGuess}
                actualPrompt=""
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
                disabled={phase !== 'playing' || isLoading || isSubmitting}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
