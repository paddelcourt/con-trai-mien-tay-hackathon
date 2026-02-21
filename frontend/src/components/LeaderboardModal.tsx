'use client';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  country: string;
  score: number;
}

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

const countryFlags: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪',
  FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷', IN: '🇮🇳',
  MX: '🇲🇽', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', SE: '🇸🇪',
  VN: '🇻🇳', PH: '🇵🇭', SG: '🇸🇬', OTHER: '🌍',
};

export default function LeaderboardModal({ entries, onClose }: LeaderboardModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#2f2f2f] rounded-xl md:rounded-2xl p-4 md:p-5 w-full max-w-sm animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-semibold text-[#ececec]">
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#383838] transition-colors text-[#8e8e8e] hover:text-[#ececec]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="space-y-1">
          {entries.slice(0, 10).map((entry) => (
            <div
              key={entry.rank}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#212121]"
            >
              <span className={`text-xs font-bold w-5 ${
                entry.rank === 1 ? 'text-[#ffd700]' :
                entry.rank === 2 ? 'text-[#c0c0c0]' :
                entry.rank === 3 ? 'text-[#cd7f32]' :
                'text-[#8e8e8e]'
              }`}>
                {entry.rank}
              </span>
              <span className="text-sm">{countryFlags[entry.country] || '🌍'}</span>
              <span className="text-sm text-[#ececec] flex-1 truncate">{entry.username}</span>
              <span className="text-xs text-[#10a37f] font-medium">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
