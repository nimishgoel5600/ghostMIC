import React from 'react';
import ProblemPanel from './ProblemPanel';
import SolutionPanel from './SolutionPanel';
import LanguageSelector from './LanguageSelector';
import { useAppStore } from '../../store/app-store';

export default function CodingMode() {
  const { isCapturing, setCapturing, settings } = useAppStore();

  const toggleCapture = () => {
    if (isCapturing) {
      window.electronAPI.stopScreenCapture();
      setCapturing(false);
    } else {
      window.electronAPI.startScreenCapture(settings.autoCaptureInterval * 1000);
      setCapturing(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-white/5">
        <LanguageSelector />
        <button
          onClick={toggleCapture}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
            isCapturing
              ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700/80'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCapturing ? 'bg-cyan-500 animate-pulse-dot' : 'bg-gray-500'
            }`}
          />
          {isCapturing ? 'Capturing' : 'Capture'}
        </button>
      </div>

      {/* Problem + Solution */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 min-h-0 border-b border-white/5">
          <ProblemPanel />
        </div>
        <div className="flex-[2] min-h-0">
          <SolutionPanel />
        </div>
      </div>
    </div>
  );
}
