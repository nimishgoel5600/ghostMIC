import React from 'react';
import { useAppStore } from '../store/app-store';

export default function ModeTabs() {
  const { mode, setMode } = useAppStore();

  return (
    <div className="flex border-b border-white/5">
      <button
        onClick={() => setMode('interview')}
        className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
          mode === 'interview'
            ? 'text-green-400 border-b-2 border-green-400 bg-green-500/5'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
        }`}
      >
        Interview Mode
      </button>
      <button
        onClick={() => setMode('coding')}
        className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
          mode === 'coding'
            ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
        }`}
      >
        Coding Mode
      </button>
    </div>
  );
}
