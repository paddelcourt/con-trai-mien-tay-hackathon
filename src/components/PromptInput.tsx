'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface PromptInputProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  guessesLeft?: number;
  placeholder?: string;
}

export default function PromptInput({
  onSubmit,
  disabled,
  isLoading,
  guessesLeft,
  placeholder = 'What question do you think was asked?',
}: PromptInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isLoading) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const isHot = guessesLeft !== undefined && guessesLeft <= 3;

  return (
    <div className="border-t border-white/5 bg-[#0d0d0d] px-4 py-3">
      <div className="max-w-3xl mx-auto">
        {guessesLeft !== undefined && (
          <div className={`text-xs mb-2 text-center font-medium ${isHot ? 'text-red-400 animate-hot-pulse' : 'text-white/30'}`}>
            {guessesLeft} guess{guessesLeft !== 1 ? 'es' : ''} remaining
          </div>
        )}
        <div className="relative flex items-end gap-2 bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-white/20 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/20 resize-none outline-none max-h-[120px] overflow-y-auto leading-relaxed disabled:opacity-40"
          />
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || disabled || isLoading}
            className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/10 disabled:text-white/20 text-white flex items-center justify-center transition-all duration-150 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-white/15 text-center mt-2">Press Enter to guess · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
