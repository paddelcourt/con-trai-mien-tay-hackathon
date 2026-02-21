'use client';

import { useEffect, useState } from 'react';
import { fetchLeaderboard, LeaderboardEntry } from '@/services/api';

const countryFlags: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪',
  FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷', IN: '🇮🇳',
  MX: '🇲🇽', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', SE: '🇸🇪',
  VN: '🇻🇳', PH: '🇵🇭', SG: '🇸🇬', OTHER: '🌍',
};

export default function ScoreTicker() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard(20);
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Keep empty entries on error
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
    // Refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  // Double the entries for seamless loop
  const allEntries = [...entries, ...entries];

  useEffect(() => {
    if (entries.length === 0) return;

    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev + 0.5;
        // Reset when we've scrolled through the first set
        if (newOffset >= entries.length * 180) {
          return 0;
        }
        return newOffset;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [entries.length]);

  if (isLoading) {
    return (
      <div className="bg-[#171717] border-b border-[#2f2f2f] h-8 flex items-center justify-center">
        <span className="text-xs text-[#8e8e8e]">Loading leaderboard...</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-[#171717] border-b border-[#2f2f2f] h-8 flex items-center justify-center">
        <span className="text-xs text-[#8e8e8e]">No scores yet - be the first!</span>
      </div>
    );
  }

  return (
    <div className="bg-[#171717] border-b border-[#2f2f2f] overflow-hidden">
      <div
        className="flex items-center py-1.5 whitespace-nowrap"
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {allEntries.map((entry, i) => (
          <div
            key={`${entry.username}-${i}`}
            className="flex items-center gap-1.5 px-3 text-xs"
          >
            <span className={`font-bold ${
              entry.rank === 1 ? 'text-[#ffd700]' :
              entry.rank === 2 ? 'text-[#c0c0c0]' :
              entry.rank === 3 ? 'text-[#cd7f32]' :
              'text-[#8e8e8e]'
            }`}>
              #{entry.rank}
            </span>
            <span>{countryFlags[entry.country] || '🌍'}</span>
            <span className="text-[#ececec] font-medium">{entry.username}</span>
            <span className="text-[#b4b4b4]">{entry.score} pts</span>
            <span className="text-[#2f2f2f] mx-2">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { countryFlags };
export type { LeaderboardEntry };
