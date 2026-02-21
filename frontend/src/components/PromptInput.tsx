'use client';

import { useState, useRef, useEffect } from 'react';

interface PromptInputProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function PromptInput({ onSubmit, disabled = false, placeholder }: PromptInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-3 md:px-4">
      <div className="relative bg-[#2f2f2f] rounded-2xl md:rounded-3xl border border-[#383838] focus-within:border-[#565656] transition-colors">
        <div className="flex items-end gap-2 p-2 md:p-3">
          {/* Attach button - hidden on mobile */}
          <button className="hidden md:flex flex-shrink-0 p-2 rounded-lg hover:bg-[#383838] transition-colors text-[#b4b4b4] hover:text-[#ececec]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>

          {/* Text input */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder || "Guess the prompt..."}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm md:text-[15px] leading-6 text-[#ececec] placeholder:text-[#8e8e8e] disabled:opacity-50 py-2 px-1"
            style={{
              minHeight: '24px',
              maxHeight: '150px',
            }}
          />

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className={`flex-shrink-0 p-2 rounded-lg transition-all ${
              value.trim()
                ? 'bg-white text-[#171717] hover:bg-[#ececec]'
                : 'bg-[#676767] text-[#2f2f2f] cursor-not-allowed'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Disclaimer text - shorter on mobile */}
      <p className="text-xs text-center text-[#8e8e8e] mt-2 md:mt-3">
        <span className="hidden md:inline">Guess the prompt that generated this AI response. </span>
        Press Enter to submit
      </p>
    </div>
  );
}
