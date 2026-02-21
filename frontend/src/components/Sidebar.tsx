'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import LeaderboardModal from './LeaderboardModal';
import DatasetModal from './DatasetModal';

interface CompletedRound {
  roundNumber: number;
  guess: string;
  actualPrompt: string;
  score: number;
}

interface SidebarProps {
  currentRound: number;
  totalScore: number;
  username?: string;
  country?: string;
  onNewGame?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // Timer props
  timerSeconds: number;
  isTimerRunning: boolean;
  onStartTimer: () => void;
  // Completed rounds
  completedRounds: CompletedRound[];
}

const countryFlags: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪',
  FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷', IN: '🇮🇳',
  MX: '🇲🇽', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', SE: '🇸🇪',
  VN: '🇻🇳', PH: '🇵🇭', SG: '🇸🇬', OTHER: '🌍',
};

// Format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function Sidebar({
  currentRound,
  totalScore,
  username = 'Player',
  country = 'OTHER',
  onNewGame,
  isCollapsed = false,
  onToggleCollapse,
  timerSeconds,
  isTimerRunning,
  onStartTimer,
  completedRounds,
}: SidebarProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showDataset, setShowDataset] = useState(false);

  // Collapsed sidebar - icons only
  if (isCollapsed) {
    return (
      <>
        <aside className="fixed left-0 top-0 bottom-0 w-[68px] flex flex-col bg-[#171717] z-50 items-center py-3">
          {/* Header row - Logo and expand button */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <Image
              src="/hackeurope_icon.png"
              alt="HackEurope"
              width={32}
              height={32}
              className="rounded-lg"
            />
            {/* Expand button */}
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-[#212121] transition-colors text-[#8e8e8e]"
              title="Expand sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 3v18"/>
              </svg>
            </button>
          </div>

          {/* New Game */}
          <button
            onClick={onNewGame}
            className="p-2.5 rounded-lg hover:bg-[#212121] transition-colors text-[#ececec] mb-1"
            title="New game"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="p-2.5 rounded-lg hover:bg-[#212121] transition-colors text-[#8e8e8e] mb-1"
            title="Leaderboard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
          </button>

          {/* Dataset */}
          <button
            onClick={() => setShowDataset(true)}
            className="p-2.5 rounded-lg hover:bg-[#212121] transition-colors text-[#8e8e8e] mb-1"
            title="Dataset"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/>
            </svg>
          </button>

          {/* Multiplayer */}
          <Link
            href="/multiplayer"
            className="p-2.5 rounded-lg hover:bg-[#212121] transition-colors text-[#8e8e8e] mb-1 flex items-center justify-center"
            title="Multiplayer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="7" r="4"/><circle cx="17" cy="7" r="4"/>
              <path d="M3 21v-2a4 4 0 0 1 4-4h4"/><path d="M15 11h4a4 4 0 0 1 4 4v2"/>
            </svg>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-[#565656] flex items-center justify-center text-xs cursor-pointer hover:opacity-80">
            {countryFlags[country] || '🌍'}
          </div>
        </aside>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
        )}

        {/* Dataset Modal */}
        {showDataset && (
          <DatasetModal onClose={() => setShowDataset(false)} />
        )}
      </>
    );
  }

  // Expanded sidebar
  return (
    <>
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col bg-[#171717] z-50">
        {/* Header - ChatGPT style */}
        <div className="p-2 flex items-center justify-between">
          <div className="p-1.5">
            <Image
              src="/hackeurope_icon.png"
              alt="HackEurope"
              width={24}
              height={24}
              className="rounded"
            />
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-[#212121] transition-colors"
            title="Collapse sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ececec" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 3v18"/>
            </svg>
          </button>
        </div>

        {/* New Game Button */}
        <div className="px-2 mb-1">
          <button
            onClick={onNewGame}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#212121] transition-colors text-[#ececec] text-[13px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            New game
          </button>
        </div>

        {/* Leaderboard Button */}
        <div className="px-2 mb-1">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#212121] transition-colors text-[#8e8e8e] text-[13px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            Leaderboard
          </button>
        </div>

        {/* Dataset Button */}
        <div className="px-2 mb-1">
          <button
            onClick={() => setShowDataset(true)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#212121] transition-colors text-[#8e8e8e] text-[13px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18"/>
            </svg>
            Dataset
          </button>
        </div>

        {/* Multiplayer Button */}
        <div className="px-2 mb-1">
          <Link
            href="/multiplayer"
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#212121] transition-colors text-[#8e8e8e] text-[13px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="7" r="4"/><circle cx="17" cy="7" r="4"/>
              <path d="M3 21v-2a4 4 0 0 1 4-4h4"/><path d="M15 11h4a4 4 0 0 1 4 4v2"/>
            </svg>
            Multiplayer
          </Link>
        </div>

        {/* Timer Section */}
        <div className="px-3 py-2 mt-1 border-t border-[#2f2f2f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-[13px] text-[#ececec] font-medium tabular-nums">
                {formatTime(timerSeconds)}
              </span>
            </div>
            {!isTimerRunning && (
              <button
                onClick={onStartTimer}
                className="text-[11px] text-[#8e8e8e] hover:text-[#ececec] transition-colors"
              >
                Start
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#8e8e8e] mt-1">
            <span>Round {currentRound}</span>
            <span className="font-medium">{totalScore} pts</span>
          </div>
        </div>

        {/* Completed Rounds - Chat History Style */}
        {completedRounds.length > 0 && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2">
              <span className="text-[11px] text-[#8e8e8e]">Completed rounds</span>
            </div>
            <div className="px-2">
              {completedRounds.slice().reverse().map((round) => (
                <div
                  key={round.roundNumber}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-[#212121] transition-colors cursor-pointer mb-0.5"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-[#ececec] truncate">
                      {round.guess.length > 25 ? round.guess.slice(0, 25) + '...' : round.guess}
                    </div>
                  </div>
                  <span className="text-[11px] text-[#8e8e8e]">{round.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spacer if no completed rounds */}
        {completedRounds.length === 0 && <div className="flex-1" />}

        {/* User Section - ChatGPT style */}
        <div className="p-2 border-t border-[#2f2f2f]">
          <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-[#212121] transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-[#565656] flex items-center justify-center text-xs">
              {countryFlags[country] || '🌍'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[#ececec] truncate">{username}</div>
              <div className="text-[11px] text-[#8e8e8e]">Free</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Dataset Modal */}
      {showDataset && (
        <DatasetModal onClose={() => setShowDataset(false)} />
      )}
    </>
  );
}

export type { CompletedRound };
