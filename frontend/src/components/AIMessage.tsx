'use client';

import { useState, useEffect } from 'react';

interface AIMessageProps {
  content: string;
  isRevealing?: boolean;
}

export default function AIMessage({ content, isRevealing = false }: AIMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!isRevealing) {
      let index = 0;
      setDisplayedContent('');
      setIsTyping(true);

      const interval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 8);

      return () => clearInterval(interval);
    } else {
      setDisplayedContent(content);
      setIsTyping(false);
    }
  }, [content, isRevealing]);

  return (
    <div className="py-4 md:py-6 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-sm md:text-[15px] leading-6 md:leading-7 text-[#ececec] whitespace-pre-wrap">
          {displayedContent}
          {isTyping && (
            <span className="inline-block w-2 h-5 ml-0.5 bg-[#ececec] animate-pulse" />
          )}
        </div>

        {/* Action buttons */}
        {!isTyping && (
          <div className="flex items-center gap-1 mt-3">
            <button className="p-1.5 rounded hover:bg-[#2f2f2f] transition-colors text-[#8e8e8e] hover:text-[#ececec]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            </button>
            <button className="p-1.5 rounded hover:bg-[#2f2f2f] transition-colors text-[#8e8e8e] hover:text-[#ececec]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
            </button>
            <button className="p-1.5 rounded hover:bg-[#2f2f2f] transition-colors text-[#8e8e8e] hover:text-[#ececec]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
              </svg>
            </button>
            <button className="p-1.5 rounded hover:bg-[#2f2f2f] transition-colors text-[#8e8e8e] hover:text-[#ececec]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
