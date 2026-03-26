import React, { useRef, useEffect } from 'react';
import { useAppStore } from '../../store/app-store';

export default function Transcript() {
  const transcript = useAppStore((s) => s.transcript);
  const isListening = useAppStore((s) => s.isListening);
  const userSpeaker = useAppStore((s) => s.userSpeaker);
  const setUserSpeaker = useAppStore((s) => s.setUserSpeaker);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const triggerAnswer = (text: string) => {
    window.dispatchEvent(
      new CustomEvent('ghostmic:question-detected', {
        detail: { text, isCoding: false },
      })
    );
  };

  const markAsMe = (speakerId: string) => {
    setUserSpeaker(speakerId);
    console.log('[GhostMic] Marked speaker', speakerId, 'as YOU');
  };

  const visibleEntries = transcript.filter((e) => e.text.trim().length > 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
          Live Transcript ({visibleEntries.length})
        </span>
        {userSpeaker && (
          <button
            onClick={() => setUserSpeaker(null)}
            className="text-[9px] text-gray-600 hover:text-gray-400"
          >
            Reset speaker ID
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
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

        {/* Speaker identification prompt */}
        {visibleEntries.length > 0 && !userSpeaker && visibleEntries.some(e => e.speaker) && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded px-2 py-1.5 text-[10px] text-blue-400 mb-2">
            Click <strong>"Me"</strong> next to YOUR voice to separate speakers. AI will only answer the interviewer.
          </div>
        )}

        {visibleEntries.map((entry) => {
          const isUser = entry.isUser || (userSpeaker !== null && entry.speaker === userSpeaker);
          const isInterviewerQuestion = entry.isQuestion && !isUser;

          return (
            <div
              key={entry.id}
              className={`group flex animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-2 py-1 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/10'
                    : isInterviewerQuestion
                      ? 'bg-yellow-500/10 text-yellow-300 font-medium border border-yellow-500/20'
                      : entry.isFinal
                        ? 'bg-white/5 text-gray-300 border border-white/5'
                        : 'text-gray-500 italic'
                }`}
              >
                {/* Speaker label */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  {entry.speaker && (
                    <span className={`text-[9px] font-medium ${isUser ? 'text-blue-500' : 'text-green-500'}`}>
                      {isUser ? 'You' : 'Interviewer'}
                      {!userSpeaker && entry.isFinal && (
                        <span className="text-[8px] text-gray-600 ml-0.5">(S{entry.speaker})</span>
                      )}
                    </span>
                  )}

                  {/* "This is me" button — shown when speaker not yet identified */}
                  {!userSpeaker && entry.speaker && entry.isFinal && (
                    <button
                      onClick={() => markAsMe(entry.speaker!)}
                      className="text-[8px] bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-1 py-0 rounded"
                    >
                      Me
                    </button>
                  )}
                </div>

                {/* Text */}
                <span>{entry.text}</span>

                {/* Answer button — only for interviewer's speech */}
                {!isUser && entry.isFinal && entry.text.length > 5 && (
                  <button
                    onClick={() => triggerAnswer(entry.text)}
                    className="ml-2 text-[9px] text-green-600 hover:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Answer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
