'use client';

import { useEffect, useState } from 'react';
import { CompletedRound } from '@/lib/types';

interface GameLostAnimationProps {
  completedRounds: CompletedRound[];
  totalGuesses: number;
  timerSeconds: number;
  actualQuestion?: string;
  onPlayAgain: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GameLostAnimation({
  completedRounds,
  totalGuesses,
  timerSeconds,
  actualQuestion,
  onPlayAgain,
}: GameLostAnimationProps) {
  const [showContent, setShowContent] = useState(false);
  const [glitching, setGlitching] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 800);
    const t2 = setTimeout(() => setGlitching(false), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Red vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-red-950/50 pointer-events-none" />

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-md w-full">
        {/* Game Over text */}
        <div className={`text-center ${glitching ? 'animate-glitch' : ''}`}>
          <div className="text-6xl md:text-8xl font-black tracking-tighter text-red-500 mb-2 select-none"
            style={{ textShadow: '3px 3px 0 #7f1d1d, -3px -3px 0 #ff6b6b' }}>
            GAME
          </div>
          <div className="text-6xl md:text-8xl font-black tracking-tighter text-red-500 select-none"
            style={{ textShadow: '3px 3px 0 #7f1d1d, -3px -3px 0 #ff6b6b' }}>
            OVER
          </div>
        </div>

        {showContent && (
          <div className="w-full animate-fade-in-up">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white">{completedRounds.length}</div>
                <div className="text-xs text-white/40">Rounds Done</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white">{totalGuesses}</div>
                <div className="text-xs text-white/40">Total Guesses</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white">{formatTime(timerSeconds)}</div>
                <div className="text-xs text-white/40">Time</div>
              </div>
            </div>

            {/* Reveal the question */}
            {actualQuestion && (
              <div className="bg-red-950/40 border border-red-800/30 rounded-xl p-4 mb-4">
                <div className="text-xs text-red-400/60 uppercase tracking-wider mb-2">The actual question was:</div>
                <p className="text-sm text-white/80 italic">&ldquo;{actualQuestion}&rdquo;</p>
              </div>
            )}

            <div className="text-center text-white/30 text-sm mb-4">
              10 guesses used — no score saved
            </div>

            <button
              onClick={onPlayAgain}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/10 hover:border-white/20"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
