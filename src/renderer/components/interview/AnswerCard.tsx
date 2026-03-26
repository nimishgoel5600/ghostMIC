import React, { useState } from 'react';
import type { QAPair } from '../../../shared/types';

interface Props {
  pair: QAPair;
}

export default function AnswerCard({ pair }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pair.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const modelLabel =
    pair.model === 'gemini' ? 'Gemini' : pair.model === 'openai' ? 'GPT-4o' : 'Claude';

  return (
    <div className="animate-fade-in bg-white/5 rounded-lg p-2 border border-white/5">
      {/* Question */}
      <div className="text-[10px] text-yellow-400 font-medium mb-1 leading-snug">
        Q: {pair.question}
      </div>

      {/* Answer */}
      <div className="text-xs text-gray-300 leading-relaxed mb-1.5 whitespace-pre-wrap">
        {pair.answer}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[9px] text-gray-600">
          <span>{modelLabel}</span>
          <span>{pair.responseTime}ms</span>
          {pair.referencedSections.length > 0 && (
            <span className="text-green-600">
              refs: {pair.referencedSections.join(', ')}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
