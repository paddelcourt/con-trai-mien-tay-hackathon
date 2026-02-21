'use client';

import { useEffect, useState } from 'react';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  country: string;
  score: number;
}

interface ScoreTickerProps {
  entries?: LeaderboardEntry[];
}

// Top leaderboard scores - replace with real data from backend
const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'maria_ai', country: 'ES', score: 485 },
  { rank: 2, username: 'kim_lee', country: 'KR', score: 472 },
  { rank: 3, username: 'sarah_k', country: 'GB', score: 458 },
  { rank: 4, username: 'pierre_fr', country: 'FR', score: 445 },
  { rank: 5, username: 'alex_dev', country: 'US', score: 432 },
  { rank: 6, username: 'yuki_san', country: 'JP', score: 418 },
  { rank: 7, username: 'tom_coder', country: 'CA', score: 405 },
  { rank: 8, username: 'hans_de', country: 'DE', score: 392 },
  { rank: 9, username: 'anna_br', country: 'BR', score: 378 },
  { rank: 10, username: 'raj_in', country: 'IN', score: 365 },
];

const countryFlags: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪',
  FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷', IN: '🇮🇳',
  MX: '🇲🇽', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', SE: '🇸🇪',
  VN: '🇻🇳', PH: '🇵🇭', SG: '🇸🇬', OTHER: '🌍',
};

export default function ScoreTicker({ entries = mockLeaderboard }: ScoreTickerProps) {
  const [offset, setOffset] = useState(0);

  // Double the entries for seamless loop
  const allEntries = [...entries, ...entries];

  useEffect(() => {
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
