'use client';

import Link from 'next/link';

interface GameOverScreenProps {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  winnerId: string | null;
  player1Id: string;
  myId: string;
  onPlayAgain: () => void;
}

export default function GameOverScreen({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  winnerId,
  player1Id,
  myId,
  onPlayAgain,
}: GameOverScreenProps) {
  const iWon = winnerId === myId;
  const isDraw = winnerId === null;
  const winnerName = winnerId === player1Id ? player1Name : player2Name;

  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center p-4">
      <div className="bg-[#2f2f2f] rounded-2xl p-6 max-w-sm w-full border border-[#383838] shadow-2xl text-center animate-fade-in">
        {/* Result emoji */}
        <div className="text-5xl mb-3 animate-score-pop">
          {isDraw ? '🤝' : iWon ? '🏆' : '🎮'}
        </div>

        <h2 className="text-2xl font-bold text-[#ececec] mb-1">
          {isDraw ? "It's a draw!" : iWon ? 'You won!' : `${winnerName} wins!`}
        </h2>
        <p className="text-xs text-[#8e8e8e] mb-6">Game over</p>

        {/* Final scores */}
        <div className="flex gap-3 mb-6">
          <div className={`flex-1 rounded-xl p-4 ${player1Id === myId ? 'bg-[#1a2420] border border-[#10a37f]/30' : 'bg-[#212121]'}`}>
            <div className="text-xs text-[#8e8e8e] mb-1 truncate">{player1Name}</div>
            <div className="text-2xl font-bold text-[#10a37f] tabular-nums">{player1Score}</div>
            <div className="text-[10px] text-[#8e8e8e]">points</div>
          </div>
          <div className="flex items-center text-[#8e8e8e] font-bold text-sm">vs</div>
          <div className={`flex-1 rounded-xl p-4 ${player1Id !== myId ? 'bg-[#1a2420] border border-[#10a37f]/30' : 'bg-[#212121]'}`}>
            <div className="text-xs text-[#8e8e8e] mb-1 truncate">{player2Name}</div>
            <div className="text-2xl font-bold text-[#10a37f] tabular-nums">{player2Score}</div>
            <div className="text-[10px] text-[#8e8e8e]">points</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-2.5 rounded-xl bg-[#10a37f] hover:bg-[#1a7f64] text-white text-sm font-medium transition-colors"
          >
            Back to Lobby
          </button>
          <Link
            href="/"
            className="block w-full py-2.5 rounded-xl bg-[#383838] hover:bg-[#444444] text-[#ececec] text-sm font-medium transition-colors"
          >
            Play Solo
          </Link>
        </div>
      </div>
    </div>
  );
}
