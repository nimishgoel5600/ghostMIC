import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/app-store';

export default function TitleBar() {
  const isListening = useAppStore((s) => s.isListening);
  const setListening = useAppStore((s) => s.setListening);
  const toggleSettings = useAppStore((s) => s.toggleSettings);
  const settingsOpen = useAppStore((s) => s.settingsOpen);
  const audioType = useAppStore((s) => s.audioType);

  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isListening && !startTime) {
      setStartTime(Date.now());
    } else if (!isListening) {
      setStartTime(null);
      setElapsed(0);
    }
  }, [isListening]);

  useEffect(() => {
    if (!isListening || !startTime) return;
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isListening, startTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div>
      <div className="drag-region flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-green-400 tracking-wider">GHOSTMIC</span>
          {isListening && (
            <span className="text-[10px] text-gray-400 font-mono">{formatTime(elapsed)}</span>
          )}
        </div>

        <div className="no-drag flex items-center gap-1.5">
          <button
            onClick={() => setListening(!isListening)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              isListening
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse-dot' : 'bg-gray-500'}`} />
            {isListening ? 'LIVE' : 'OFF'}
          </button>

          <button
            onClick={toggleSettings}
            className={`p-1 rounded transition-colors ${settingsOpen ? 'text-green-400 bg-green-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <button
            onClick={() => window.electronAPI.minimizeToTray()}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Speaker diarization active indicator */}
      {isListening && audioType === 'mic' && (
        <div className="no-drag flex items-center px-3 py-0.5 bg-green-500/10 border-b border-green-500/10 text-[9px] text-green-500">
          Speaker diarization active — click "Me" on your voice to separate speakers
        </div>
      )}
    </div>
  );
}
