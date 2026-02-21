'use client';

import { MpRoundGuess } from '@/services/api';

const countryFlags: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', CA: '🇨🇦', AU: '🇦🇺', DE: '🇩🇪',
  FR: '🇫🇷', JP: '🇯🇵', KR: '🇰🇷', BR: '🇧🇷', IN: '🇮🇳',
  MX: '🇲🇽', ES: '🇪🇸', IT: '🇮🇹', NL: '🇳🇱', SE: '🇸🇪',
  VN: '🇻🇳', PH: '🇵🇭', SG: '🇸🇬', OTHER: '🌍',
};

interface PlayerBoardProps {
  playerName: string;
  country: string;
  score: number;
  roundGuesses: MpRoundGuess[];
  isMe: boolean;
  isTyping: boolean;
  roundWon: boolean;
}

export default function PlayerBoard({
  playerName,
  country,
  score,
  roundGuesses,
  isMe,
  isTyping,
  roundWon,
}: PlayerBoardProps) {
  const flag = countryFlags[country] || '🌍';

  return (
    <div className={`flex flex-col flex-1 min-w-0 rounded-xl border ${
      isMe
        ? 'border-[#10a37f]/40 bg-[#1a2420]'
        : 'border-[#383838] bg-[#1a1a1a]'
    } overflow-hidden`}>
      {/* Player Header */}
      <div className={`flex items-center justify-between px-3 py-2 border-b ${
        isMe ? 'border-[#10a37f]/20 bg-[#1f2e29]' : 'border-[#2f2f2f] bg-[#212121]'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            isMe ? 'bg-[#10a37f]/30' : 'bg-[#383838]'
          }`}>
            {flag}
          </div>
          <span className={`text-sm font-medium truncate max-w-[100px] ${
            isMe ? 'text-[#10a37f]' : 'text-[#ececec]'
          }`}>
            {playerName}
            {isMe && <span className="text-[10px] text-[#8e8e8e] ml-1">(you)</span>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {roundWon && (
            <span className="text-xs text-[#f59e0b] font-medium">Round won!</span>
          )}
          <div className={`text-sm font-bold tabular-nums ${
            isMe ? 'text-[#10a37f]' : 'text-[#ececec]'
          }`}>
            {score}
            <span className="text-[10px] font-normal text-[#8e8e8e] ml-0.5">pts</span>
          </div>
        </div>
      </div>

      {/* Guess History */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[120px]">
        {roundGuesses.length === 0 && !isTyping && (
          <div className="text-[#8e8e8e] text-xs italic text-center mt-4">
            {isMe ? 'Type your guess below...' : 'Waiting for opponent...'}
          </div>
        )}

        {roundGuesses.map((guess) => (
          <div key={guess.id} className="animate-fade-in">
            {/* Guess bubble */}
            <div className="flex justify-end mb-1">
              <div className={`bg-[#2f2f2f] rounded-xl px-3 py-1.5 max-w-[90%] text-xs text-[#ececec]`}>
                {guess.guess}
              </div>
            </div>
            {/* Feedback */}
            {guess.score !== null && (
              <div className={`flex items-center gap-1 text-[10px] ml-1 ${
                guess.is_correct ? 'text-[#10b981]' : 'text-[#ef4444]'
              }`}>
                {guess.is_correct ? (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Correct! {guess.score}%</span>
                  </>
                ) : (
                  <>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{guess.score}%{guess.hint ? ` — ${guess.hint}` : ''}</span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-end animate-fade-in">
            <div className="bg-[#2f2f2f] rounded-xl px-3 py-2 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-[#8e8e8e] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#8e8e8e] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#8e8e8e] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
