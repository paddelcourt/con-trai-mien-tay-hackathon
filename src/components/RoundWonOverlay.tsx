'use client';

import { useEffect, useState } from 'react';

interface RoundWonOverlayProps {
  roundNumber: number;
  guessCount: number;
  actualQuestion: string;
  onNextRound: () => void;
}

export default function RoundWonOverlay({ roundNumber, guessCount, actualQuestion, onNextRound }: RoundWonOverlayProps) {
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onNextRound]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="pointer-events-auto animate-fade-in-up">
        <div className="bg-[#0d1a14] border border-emerald-500/30 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl shadow-emerald-900/40 animate-winner-glow">
          <div className="text-5xl mb-3 animate-float">🎉</div>
          <h2 className="text-2xl font-bold text-emerald-400 mb-1">Round {roundNumber} Complete!</h2>
          <p className="text-white/50 text-sm mb-4">
            Solved in {guessCount} guess{guessCount !== 1 ? 'es' : ''}
          </p>

          <div className="bg-white/5 rounded-xl p-3 mb-5">
            <div className="text-xs text-white/30 uppercase tracking-wider mb-1">The question was:</div>
            <p className="text-sm text-white/80 italic">&ldquo;{actualQuestion}&rdquo;</p>
          </div>

          <div className="text-sm text-white/40">
            Next round in <span className="text-emerald-400 font-bold text-lg">{countdown}</span>...
          </div>

          <button
            onClick={onNextRound}
            className="mt-4 w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            Next Round →
          </button>
        </div>
      </div>
    </div>
  );
}
