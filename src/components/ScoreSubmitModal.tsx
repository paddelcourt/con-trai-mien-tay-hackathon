'use client';

import { useState, useRef, useEffect } from 'react';
import { COUNTRIES } from '@/lib/countries';

interface ScoreSubmitModalProps {
  score: number;
  roundsCompleted: number;
  totalGuesses: number;
  totalTime: number;
  onSubmit: (username: string, country: string) => Promise<void>;
  onSkip: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ScoreSubmitModal({
  score,
  roundsCompleted,
  totalGuesses,
  totalTime,
  onSubmit,
  onSkip,
}: ScoreSubmitModalProps) {
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectedCountryData = COUNTRIES.find((c) => c.code === country);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCountrySelect = (code: string, name: string) => {
    setCountry(code);
    setCountrySearch(name);
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!country) {
      setError('Please select your country');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit(username.trim(), country);
    } catch {
      setError('Failed to save score. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-white/5">
          <div className="text-4xl text-center mb-3 animate-float">🏆</div>
          <h2 className="text-xl font-bold text-white text-center">Game Complete!</h2>
          <p className="text-white/40 text-sm text-center mt-1">Save your score to the leaderboard</p>
        </div>

        {/* Score summary */}
        <div className="grid grid-cols-3 gap-3 p-5">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-emerald-400">{roundsCompleted}</div>
            <div className="text-xs text-white/30 mt-0.5">Rounds</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white">{totalGuesses}</div>
            <div className="text-xs text-white/30 mt-0.5">Guesses</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white font-mono">{formatTime(totalTime)}</div>
            <div className="text-xs text-white/30 mt-0.5">Time</div>
          </div>
        </div>

        <div className="px-5 pb-1 text-center">
          <span className="text-xs text-white/30">Final score: </span>
          <span className="text-lg font-mono font-bold text-white">{score.toLocaleString()}</span>
          <span className="text-xs text-white/20 ml-1">(lower is better)</span>
        </div>

        {/* Form */}
        <div className="p-5 flex flex-col gap-3">
          {/* Username */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Your Name *</label>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter your name..."
              maxLength={30}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>

          {/* Country */}
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Country Flag *</label>
            <div ref={dropdownRef} className="relative">
              <div
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white cursor-pointer flex items-center gap-2 focus-within:border-emerald-500/50 transition-colors"
                onClick={() => {
                  setShowDropdown(true);
                  setCountrySearch('');
                }}
              >
                {selectedCountryData ? (
                  <>
                    <span className={`fi fi-${selectedCountryData.code} rounded-sm flex-shrink-0`} style={{ width: '20px', height: '14px' }} />
                    <span>{selectedCountryData.name}</span>
                  </>
                ) : (
                  <span className="text-white/20">Pick your country flag</span>
                )}
                <svg className="w-4 h-4 text-white/20 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
                  <div className="p-2 border-b border-white/5">
                    <input
                      autoFocus
                      type="text"
                      value={countrySearch}
                      onChange={(e) => setCountrySearch(e.target.value)}
                      placeholder="Search country..."
                      className="w-full bg-white/5 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/20 outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCountries.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleCountrySelect(c.code, c.name)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition-colors text-left"
                      >
                        <span className={`fi fi-${c.code} rounded-sm flex-shrink-0`} style={{ width: '20px', height: '14px' }} />
                        {c.name}
                      </button>
                    ))}
                    {filteredCountries.length === 0 && (
                      <div className="px-4 py-3 text-sm text-white/30 text-center">No countries found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors mt-1"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save to Leaderboard'
            )}
          </button>

          <button
            onClick={onSkip}
            className="w-full py-2 text-sm text-white/30 hover:text-white/60 transition-colors"
          >
            Skip (don&apos;t save)
          </button>
        </div>
      </div>
    </div>
  );
}
