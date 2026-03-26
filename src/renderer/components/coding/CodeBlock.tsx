import React, { useState } from 'react';

interface Props {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative rounded-lg bg-black/40 border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 bg-white/5 border-b border-white/5">
        <span className="text-[9px] text-gray-500 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors"
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>

      {/* Code */}
      <pre className="p-3 overflow-x-auto text-[11px] leading-relaxed">
        <code className="text-gray-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
