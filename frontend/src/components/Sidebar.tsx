'use client';

interface SidebarProps {
  currentRound: number;
  totalRounds: number;
  totalScore: number;
  onNewGame?: () => void;
}

export default function Sidebar({ currentRound, totalRounds, totalScore, onNewGame }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col bg-[#171717] z-50">
      {/* Header */}
      <div className="p-3">
        <button
          onClick={onNewGame}
          className="w-full flex items-center gap-2 px-3 py-3 rounded-lg hover:bg-[#212121] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#000"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#000" strokeWidth="2"/>
            </svg>
          </div>
          <span className="text-sm font-medium text-[#ececec]">New game</span>
          <svg className="ml-auto" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-2 border-b border-[#383838]">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#212121] transition-colors text-[#b4b4b4] text-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          Search games
        </button>
      </nav>

      {/* Game Stats Section */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="text-xs font-medium text-[#8e8e8e] px-3 mb-3">Current Game</div>

        {/* Stats Cards - Simplified */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-[#212121]">
            <span className="text-sm text-[#b4b4b4]">Round</span>
            <span className="text-sm font-medium text-[#ececec]">
              {currentRound}<span className="text-[#8e8e8e]">/{totalRounds}</span>
            </span>
          </div>

          <div className="flex items-center justify-between px-3 py-3 rounded-lg bg-[#212121]">
            <span className="text-sm text-[#b4b4b4]">Score</span>
            <span className="text-sm font-medium text-[#10a37f]">{totalScore}</span>
          </div>
        </div>

        {/* How to Play */}
        <div className="mt-6">
          <div className="text-xs font-medium text-[#8e8e8e] px-3 mb-3">How to Play</div>
          <div className="space-y-2 text-sm text-[#b4b4b4] px-3">
            <p>1. Read the AI response</p>
            <p>2. Guess the prompt</p>
            <p>3. See your score</p>
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="p-3 border-t border-[#383838]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#212121] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#565656] flex items-center justify-center text-white text-sm font-medium">
            P
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[#ececec]">Player</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
