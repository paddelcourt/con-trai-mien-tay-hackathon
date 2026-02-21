'use client';

import { useState } from 'react';

interface AIMessageProps {
  response: string;
  roundNumber: number;
  isLoading?: boolean;
}

export default function AIMessage({ response, roundNumber, isLoading }: AIMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3 px-4 py-4 animate-fade-in-up">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-900/30">
        AI
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-emerald-400">AI Response</span>
          <span className="text-xs text-white/20 bg-white/5 px-2 py-0.5 rounded-full">Round {roundNumber}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-white/40">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs">Generating question...</span>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/85 leading-relaxed">{response}</p>
            <button
              onClick={handleCopy}
              className="mt-2 text-xs text-white/20 hover:text-white/50 transition-colors flex items-center gap-1"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
