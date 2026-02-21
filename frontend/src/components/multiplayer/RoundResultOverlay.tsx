'use client';

import { useEffect, useState } from 'react';

interface RoundResultOverlayProps {
  roundNum: number;
  totalRounds: number;
  winnerName: string | null;
  myName: string;
  actualPrompt: string;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  onContinue: () => void;
}

export default function RoundResultOverlay({
  roundNum,
  totalRounds,
  winnerName,
  myName,
  actualPrompt,
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  onContinue,
}: RoundResultOverlayProps) {
  const [countdown, setCountdown] = useState(5);
  const iWon = winnerName === myName;
  const isDraw = winnerName === null;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#2f2f2f] rounded-2xl p-6 max-w-sm w-full border border-[#383838] shadow-2xl animate-slide-up">
        {/* Round result header */}
        <div className="text-center mb-4">
          <div className={`text-3xl mb-2 ${isDraw ? '' : iWon ? 'animate-score-pop' : ''}`}>
            {isDraw ? '🤝' : iWon ? '🎉' : '😅'}
          </div>
          <h3 className="text-lg font-bold text-[#ececec]">
            {isDraw ? 'Draw!' : iWon ? 'You won this round!' : `${winnerName} won the round`}
          </h3>
          <p className="text-xs text-[#8e8e8e] mt-1">
            Round {roundNum - 1} of {totalRounds}
          </p>
        </div>

        {/* Actual prompt reveal */}
        <div className="bg-[#212121] rounded-xl p-3 mb-4">
          <div className="text-[10px] text-[#8e8e8e] uppercase tracking-wider mb-1">The actual prompt was</div>
          <div className="text-sm text-[#10a37f] font-medium">&ldquo;{actualPrompt}&rdquo;</div>
        </div>

        {/* Score summary */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-[#212121] rounded-lg p-2 text-center">
            <div className="text-xs text-[#8e8e8e] truncate">{player1Name}</div>
            <div className="text-lg font-bold text-[#10a37f] tabular-nums">{player1Score}</div>
          </div>
          <div className="flex items-center text-[#8e8e8e] text-sm font-bold">vs</div>
          <div className="flex-1 bg-[#212121] rounded-lg p-2 text-center">
            <div className="text-xs text-[#8e8e8e] truncate">{player2Name}</div>
            <div className="text-lg font-bold text-[#10a37f] tabular-nums">{player2Score}</div>
          </div>
        </div>

        {/* Countdown */}
        <div className="text-center text-xs text-[#8e8e8e]">
          Next round in <span className="text-[#ececec] font-medium tabular-nums">{countdown}s</span>
        </div>
      </div>
    </div>
  );
}
