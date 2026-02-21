'use client';

import { useEffect, useState } from 'react';
import { getScoreMessage } from '@/data/gameData';

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
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

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
    <div className="py-4 md:py-6 animate-slide-up">
      <div className="max-w-3xl mx-auto px-3 md:px-4">
        {/* Score Display */}
        {showScore && (
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex flex-col items-center gap-1.5 md:gap-2 bg-[#2f2f2f] rounded-xl md:rounded-2xl px-6 py-4 md:px-8 md:py-6">
              <span className="text-xs uppercase tracking-wider text-[#8e8e8e]">Match Score</span>
              <div
                className="text-4xl md:text-5xl font-bold animate-score-pop"
                style={{ color: getScoreColor(score) }}
              >
                {animatedScore}%
              </div>
              <span className="text-xs md:text-sm text-[#b4b4b4]">{getScoreMessage(score)}</span>
            </div>
          </div>
        )}

        {/* Comparison */}
        {showComparison && (
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {/* User's guess - displayed like a user message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] md:max-w-[80%]">
                <div className="text-xs text-[#8e8e8e] text-right mb-1">Your guess</div>
                <div className="bg-[#2f2f2f] rounded-2xl md:rounded-3xl px-4 py-2.5 md:px-5 md:py-3 text-sm md:text-base text-[#ececec]">
                  {userGuess}
                </div>
              </div>
            </div>

            {/* Actual prompt */}
            <div className="flex gap-3 md:gap-4">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#10a37f] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="md:w-4 md:h-4">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#10a37f] mb-1">Actual Prompt</div>
                <div className="text-[#ececec] text-sm md:text-[15px] leading-6 md:leading-7">
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
              className="flex items-center gap-2 bg-[#10a37f] hover:bg-[#1a7f64] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium transition-colors"
            >
              Next Round
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-[18px] md:h-[18px]">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
