'use client';

import { useEffect, useState } from 'react';

function getScoreMessage(score: number): string {
  if (score >= 90) return "Incredible! You're a mind reader!";
  if (score >= 70) return "So close! Great intuition!";
  if (score >= 50) return "You're on the right track!";
  if (score >= 30) return "Some good ideas there!";
  return "Nice try! The answer might surprise you.";
}

interface RevealSectionProps {
  userGuess: string;
  actualPrompt: string;
  score: number;
  onNextRound: () => void;
}

export default function RevealSection({
  userGuess,
  actualPrompt,
  score,
  onNextRound,
}: RevealSectionProps) {
  const [showScore, setShowScore] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowScore(true), 300);
    const timer2 = setTimeout(() => setShowComparison(true), 800);
    // Auto-advance to next round after 3 seconds
    const timer3 = setTimeout(() => onNextRound(), 3500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onNextRound]);

  useEffect(() => {
    if (showScore) {
      const duration = 1000;
      const steps = 30;
      const increment = score / steps;
      let current = 0;

      const interval = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [showScore, score]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#10b981';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="py-2 md:py-3 animate-slide-up">
      <div className="max-w-3xl mx-auto px-3 md:px-4">
        {/* Score Display */}
        {showScore && (
          <div className="text-center mb-4 md:mb-5">
            <div className="inline-flex flex-col items-center gap-1 bg-[#2f2f2f] rounded-lg md:rounded-xl px-4 py-3 md:px-5 md:py-4">
              <span className="text-[10px] uppercase tracking-wider text-[#8e8e8e]">Match Score</span>
              <div
                className="text-2xl md:text-3xl font-bold animate-score-pop"
                style={{ color: getScoreColor(score) }}
              >
                {animatedScore}%
              </div>
              <span className="text-[10px] md:text-xs text-[#b4b4b4]">{getScoreMessage(score)}</span>
            </div>
          </div>
        )}

        {/* Comparison */}
        {showComparison && (
          <div className="space-y-2 md:space-y-3 mb-4 md:mb-5">
            {/* User's guess - displayed like a user message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] md:max-w-[80%]">
                <div className="text-[10px] text-[#8e8e8e] text-right mb-0.5">Your guess</div>
                <div className="bg-[#2f2f2f] rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-2.5 text-[13px] md:text-sm text-[#ececec]">
                  {userGuess}
                </div>
              </div>
            </div>

            {/* Actual prompt */}
            <div className="flex gap-2 md:gap-3">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="md:w-3 md:h-3">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-[#10a37f] mb-0.5">Actual Prompt</div>
                <div className="text-[#ececec] text-[13px] md:text-sm leading-5 md:leading-6">
                  &ldquo;{actualPrompt}&rdquo;
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Round Button */}
        {showComparison && (
          <div className="flex justify-center">
            <button
              onClick={onNextRound}
              className="flex items-center gap-1.5 bg-[#10a37f] hover:bg-[#1a7f64] text-white px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-colors"
            >
              Next Round
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-[14px] md:h-[14px]">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
