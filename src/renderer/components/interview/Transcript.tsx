import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/app-store';

export default function Transcript() {
  const transcript = useAppStore((s) => s.transcript);
  const isListening = useAppStore((s) => s.isListening);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const triggerAnswer = (text: string) => {
    console.log('[GhostMic] Manual answer trigger for:', text.substring(0, 50));
    window.dispatchEvent(
      new CustomEvent('ghostmic:question-detected', {
        detail: { text, isCoding: false },
      })
    );
  };

  const visibleEntries = transcript.filter((e) => e.text.trim().length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-white/5">
        Live Transcript ({visibleEntries.length})
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {visibleEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 text-xs">
            {isListening ? (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot mb-2" />
                <span>Listening for audio...</span>
              </>
            ) : (
              <>
                <span>Click LIVE to start listening</span>
                <span className="text-[10px] text-gray-700 mt-1">Or press Ctrl+Shift+L</span>
              </>
            )}
          </div>
        )}

        {visibleEntries.map((entry) => (
          <div
            key={entry.id}
            className={`group flex items-start gap-1 text-xs leading-relaxed animate-fade-in ${
              entry.isQuestion
                ? 'text-yellow-300 font-medium bg-yellow-500/10 -mx-1 px-1 py-0.5 rounded'
                : entry.isFinal
                  ? 'text-gray-300'
                  : 'text-gray-500 italic'
            }`}
          >
            <div className="flex-1 min-w-0">
              {entry.speaker && (
                <span className="text-gray-500 text-[10px] mr-1">[{entry.speaker}]</span>
              )}
              {entry.text}
            </div>

            {/* Always show Answer button on final entries */}
            {entry.isFinal && entry.text.length > 5 && (
              <button
                onClick={() => triggerAnswer(entry.text)}
                className="shrink-0 text-[9px] text-green-600 hover:text-green-400 bg-green-500/10 hover:bg-green-500/20 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                title="Generate AI answer for this"
              >
                Answer
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
