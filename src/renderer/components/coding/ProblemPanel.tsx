import React from 'react';
import { useAppStore } from '../../store/app-store';

export default function ProblemPanel() {
  const { currentProblem, isCapturing } = useAppStore();

  if (!currentProblem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 text-xs px-4 text-center">
        {isCapturing ? (
          <>
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-dot mb-2" />
            <span>Scanning for coding problems...</span>
          </>
        ) : (
          <>
            <span>Start screen capture to detect coding problems</span>
            <span className="text-[10px] text-gray-700 mt-1">
              Or problems detected from audio will appear here
            </span>
          </>
        )}
      </div>
    );
  }

  const difficultyColors = {
    Easy: 'text-green-400 bg-green-500/10',
    Medium: 'text-yellow-400 bg-yellow-500/10',
    Hard: 'text-red-400 bg-red-500/10',
    Unknown: 'text-gray-400 bg-gray-500/10',
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto px-3 py-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-cyan-300">{currentProblem.title}</span>
        <span
          className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${difficultyColors[currentProblem.difficulty]}`}
        >
          {currentProblem.difficulty}
        </span>
      </div>

      {/* Platform */}
      {currentProblem.platform !== 'Unknown' && (
        <span className="text-[9px] text-gray-500 mb-1">{currentProblem.platform}</span>
      )}

      {/* Description */}
      <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
        {currentProblem.description}
      </p>

      {/* Tags */}
      {currentProblem.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {currentProblem.tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
