import React from 'react';
import Transcript from './Transcript';
import AnswerPanel from './AnswerPanel';

export default function InterviewMode() {
  return (
    <div className="flex flex-col h-full">
      {/* Transcript area - top half */}
      <div className="flex-1 min-h-0 border-b border-white/5">
        <Transcript />
      </div>

      {/* Answer area - bottom half */}
      <div className="flex-1 min-h-0">
        <AnswerPanel />
      </div>
    </div>
  );
}
