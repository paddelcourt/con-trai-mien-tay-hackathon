'use client';

import { CompletedRound } from '@/lib/types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  timerSeconds: number;
  totalGuesses: number;
  completedRounds: CompletedRound[];
  currentRoundNumber: number;
  onEndGame: () => void;
  onShowLeaderboard: () => void;
  gamePhase: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}


export default function Sidebar({
  collapsed,
  onToggle,
  timerSeconds,
  totalGuesses,
  completedRounds,
  currentRoundNumber,
  onEndGame,
  onShowLeaderboard,
  gamePhase,
}: SidebarProps) {
  const canEndGame = completedRounds.length > 0 && gamePhase === 'playing';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden w-8 h-8 flex items-center justify-center text-white/60 hover:text-white bg-[#111] border border-white/10 rounded-lg transition-colors"
      >
        {collapsed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-[#111111] border-r border-white/5
          transition-all duration-300 ease-in-out
          ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-r-0' : 'translate-x-0 w-64'}
        `}
      >
        <div className="flex flex-col h-full p-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">?</span>
              </div>
              <span className="text-sm font-semibold text-white/80">Guess The Prompt</span>
            </div>
            <button
              onClick={onToggle}
              className="hidden lg:flex w-6 h-6 items-center justify-center text-white/30 hover:text-white/70 transition-colors rounded"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 mb-1">Time</div>
              <div className="text-lg font-mono font-bold text-white">{formatTime(timerSeconds)}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 mb-1">Round</div>
              <div className="text-lg font-mono font-bold text-white">{currentRoundNumber}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 mb-1">Guesses</div>
              <div className="text-lg font-mono font-bold text-white">{totalGuesses}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-xs text-white/30 mb-1">Score</div>
              <div className="text-lg font-mono font-bold text-white">
                {totalGuesses * timerSeconds > 0 ? (totalGuesses * timerSeconds).toLocaleString() : '—'}
              </div>
            </div>
          </div>

          {/* Round history */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-xs text-white/30 font-medium uppercase tracking-wider mb-2">
              Completed Rounds
            </div>
            {completedRounds.length === 0 ? (
              <p className="text-xs text-white/20 italic">No rounds completed yet</p>
            ) : (
              <div className="flex flex-col gap-1">
                {completedRounds.map((round) => (
                  <div
                    key={round.roundNumber}
                    className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 animate-slide-in-right"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-xs text-emerald-400 font-bold">{round.roundNumber}</span>
                      </div>
                      <span className="text-xs text-white/50">{round.guesses.length} guess{round.guesses.length !== 1 ? 'es' : ''}</span>
                    </div>
                    <span className="text-xs text-white/30 font-mono">{formatTime(round.timeTaken)}s</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
            <button
              onClick={onShowLeaderboard}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Leaderboard
            </button>

            {canEndGame && (
              <button
                onClick={onEndGame}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 hover:text-emerald-300 border border-emerald-600/20 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                End Game & Save Score
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
