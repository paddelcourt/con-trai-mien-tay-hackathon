'use client';

import { GuessResult } from '@/lib/types';
import HotColdMeter from './HotColdMeter';

interface GuessMessageProps {
  guess: GuessResult;
  index: number;
  isLatest?: boolean;
  maxGuesses?: number;
}

export default function GuessMessage({ guess, index, isLatest, maxGuesses = 10 }: GuessMessageProps) {
  const guessNumber = index + 1;
  const isWinning = guess.score >= 90;

  return (
    <div className={`message-appear flex flex-col gap-1 ${isWinning ? 'animate-winner-glow rounded-xl p-3' : 'p-3'}`}>
      {/* User bubble */}
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-[#2a2a2a] rounded-2xl rounded-tr-sm px-4 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-white/30">Guess {guessNumber}/{maxGuesses}</span>
          </div>
          <p className="text-sm text-white/90">{guess.guess}</p>
        </div>
      </div>

      {/* Score response */}
      {guess.pending ? (
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-[#1a1a1a] border border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-start">
          <div className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 ${
            isWinning
              ? 'bg-emerald-950/60 border border-emerald-500/30'
              : 'bg-[#1a1a1a] border border-white/5'
          }`}>
            {isWinning ? (
              <div className="text-center py-1">
                <div className="text-2xl mb-1">🎉</div>
                <p className="text-emerald-400 font-bold text-sm">You got it!</p>
                <p className="text-white/60 text-xs mt-0.5">{guess.feedback}</p>
              </div>
            ) : (
              <HotColdMeter score={guess.score} feedback={guess.feedback} isNew={isLatest} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
