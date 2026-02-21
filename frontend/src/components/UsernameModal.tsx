'use client';

import { useState } from 'react';

interface UsernameModalProps {
  onSubmit: (username: string, country: string) => void;
}

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'OTHER', name: 'Other', flag: '🌍' },
];

export default function UsernameModal({ onSubmit }: UsernameModalProps) {
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!country) {
      setError('Please select a country');
      return;
    }
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    if (username.trim().length > 15) {
      setError('Username must be 15 characters or less');
      return;
    }
    onSubmit(username.trim(), country);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#2f2f2f] rounded-xl md:rounded-2xl p-4 md:p-6 w-full max-w-sm animate-fade-in shadow-2xl border border-[#383838]">
        <h2 className="text-base md:text-lg font-semibold text-[#ececec] mb-1 text-center">
          Welcome to Guess The Prompt
        </h2>
        <p className="text-xs text-[#8e8e8e] mb-4 text-center">
          Enter your details to join the leaderboard
        </p>

        <div className="space-y-3">
          {/* Username Input */}
          <div>
            <label className="text-[10px] text-[#8e8e8e] uppercase tracking-wider mb-1 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter username..."
              maxLength={15}
              className="w-full bg-[#212121] rounded-lg px-3 py-2 text-sm text-[#ececec] placeholder:text-[#8e8e8e] outline-none border border-[#383838] focus:border-[#565656] transition-colors"
            />
          </div>

          {/* Country Select */}
          <div>
            <label className="text-[10px] text-[#8e8e8e] uppercase tracking-wider mb-1 block">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setError('');
              }}
              className="w-full bg-[#212121] rounded-lg px-3 py-2 text-sm text-[#ececec] outline-none border border-[#383838] focus:border-[#565656] transition-colors appearance-none cursor-pointer"
            >
              <option value="" disabled>Select country...</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-xs text-[#ef4444] text-center">{error}</p>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-2 md:py-2.5 rounded-lg bg-[#10a37f] hover:bg-[#1a7f64] text-white text-sm font-medium transition-colors mt-2"
          >
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}

export { countries };
