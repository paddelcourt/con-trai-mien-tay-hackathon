'use client';

import { useEffect, useState } from 'react';
import { LeaderboardEntry } from '@/lib/types';

interface LeaderboardModalProps {
  onClose: () => void;
  highlightId?: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getRankIcon(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export default function LeaderboardModal({ onClose, highlightId }: LeaderboardModalProps) {
  const [tab, setTab] = useState<'top10' | 'all'>('top10');
  const [data, setData] = useState<{ top10: LeaderboardEntry[]; all: LeaderboardEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load leaderboard');
        setLoading(false);
      });
  }, []);

  const entries = tab === 'top10' ? data?.top10 : data?.all;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="text-lg font-bold text-white">Leaderboard</h2>
            <p className="text-xs text-white/30 mt-0.5">Lower score = fewer guesses × less time</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3 border-b border-white/5">
          {(['top10', 'all'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'top10' ? 'Top 10' : 'All Results'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-400 text-sm">{error}</div>
          )}

          {!loading && !error && entries && entries.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-white/30 text-sm">No scores yet. Be the first!</p>
            </div>
          )}

          {!loading && !error && entries && entries.length > 0 && (
            <div className="flex flex-col gap-2">
              {/* Column headers */}
              <div className="grid grid-cols-[40px_1fr_80px_60px_60px_70px] gap-3 px-3 text-xs text-white/20 uppercase tracking-wider">
                <div>Rank</div>
                <div>Player</div>
                <div className="text-right">Score</div>
                <div className="text-right">Rounds</div>
                <div className="text-right">Guesses</div>
                <div className="text-right">Time</div>
              </div>

              {entries.map((entry, index) => {
                const rank = index + 1;
                const isHighlighted = entry.id === highlightId;

                return (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-[40px_1fr_80px_60px_60px_70px] gap-3 items-center px-3 py-2.5 rounded-xl transition-colors ${
                      isHighlighted
                        ? 'bg-emerald-900/30 border border-emerald-500/20'
                        : rank <= 3
                        ? 'bg-white/5 border border-white/5'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Rank */}
                    <div className="text-sm font-bold text-center">
                      {rank <= 3 ? getRankIcon(rank) : <span className="text-white/30">#{rank}</span>}
                    </div>

                    {/* Player */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`fi fi-${entry.country} rounded-sm flex-shrink-0`}
                        style={{ width: '20px', height: '14px', display: 'inline-block' }}
                      />
                      <span className="text-sm text-white/80 font-medium truncate">{entry.username}</span>
                      {isHighlighted && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full flex-shrink-0">You</span>
                      )}
                    </div>

                    {/* Score */}
                    <div className={`text-sm font-mono font-bold text-right ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-white/60'}`}>
                      {entry.score.toLocaleString()}
                    </div>

                    {/* Rounds */}
                    <div className="text-sm text-white/40 text-right">{entry.rounds_completed}</div>

                    {/* Guesses */}
                    <div className="text-sm text-white/40 text-right">{entry.total_guesses}</div>

                    {/* Time */}
                    <div className="text-sm text-white/40 font-mono text-right">{formatTime(entry.total_time)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
