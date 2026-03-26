import React from 'react';
import { useAppStore } from '../../store/app-store';
import AnswerCard from './AnswerCard';

export default function AnswerPanel() {
  const qaPairs = useAppStore((s) => s.qaPairs);
  const currentAnswer = useAppStore((s) => s.currentAnswer);
  const isGenerating = useAppStore((s) => s.isGenerating);

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-white/5">
        AI Answers
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {/* Currently generating or error */}
        {(isGenerating || currentAnswer) && (
          <div className="animate-fade-in bg-green-500/5 border border-green-500/20 rounded-lg p-2">
            <div className="flex items-center gap-1.5 mb-1">
              {isGenerating && (
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
              )}
              <span className="text-[10px] text-green-500 font-medium">
                {isGenerating ? 'Generating...' : 'Done'}
              </span>
            </div>
            {currentAnswer ? (
              <p className={`text-xs leading-relaxed whitespace-pre-wrap ${
                currentAnswer.startsWith('Error') ? 'text-red-400' : 'text-gray-300'
              } ${isGenerating ? 'streaming-cursor' : ''}`}>
                {currentAnswer}
              </p>
            ) : isGenerating ? (
              <p className="text-xs text-gray-500 italic">Waiting for AI response...</p>
            ) : null}
          </div>
        )}

        {/* Past Q&A pairs */}
        {qaPairs.map((pair) => (
          <AnswerCard key={pair.id} pair={pair} />
        ))}

        {qaPairs.length === 0 && !isGenerating && !currentAnswer && (
          <div className="flex items-center justify-center h-full text-gray-600 text-xs">
            Answers will appear here when questions are detected
          </div>
        )}
      </div>
    </div>
  );
}
