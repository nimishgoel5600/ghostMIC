import React from 'react';
import { useAppStore } from '../store/app-store';

export default function StatusBar() {
  const { settings, mode, isListening, isCapturing } = useAppStore();

  const hasResume = !!settings.resumeParsed;
  const hasJD = !!settings.jobDescription;
  const modelLabel =
    settings.defaultLLM === 'gemini'
      ? 'Gemini'
      : settings.defaultLLM === 'openai'
        ? 'GPT-4o'
        : 'Claude';

  return (
    <div className="flex items-center justify-between px-3 py-1 bg-black/30 border-t border-white/5 text-[9px] text-gray-500">
      <div className="flex items-center gap-2">
        {/* Model */}
        <span className="text-gray-400">{modelLabel}</span>

        {/* Resume status */}
        <span className={hasResume ? 'text-green-500' : 'text-red-500'}>
          {hasResume ? '● Resume' : '○ Resume'}
        </span>

        {/* JD status */}
        <span className={hasJD ? 'text-green-500' : 'text-red-500'}>
          {hasJD ? '● JD' : '○ JD'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {mode === 'interview' && (
          <span className={isListening ? 'text-green-500' : 'text-gray-500'}>
            {isListening ? '● Audio' : '○ Audio'}
          </span>
        )}
        {mode === 'coding' && (
          <>
            <span className={isCapturing ? 'text-cyan-500' : 'text-gray-500'}>
              {isCapturing ? '● Capture' : '○ Capture'}
            </span>
            <span className="text-gray-400">
              {settings.preferredLanguage.toUpperCase()}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
