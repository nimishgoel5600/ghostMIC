import React from 'react';
import { useAppStore } from '../store/app-store';
import TitleBar from './TitleBar';
import ModeTabs from './ModeTabs';
import StatusBar from './StatusBar';
import InterviewMode from './interview/InterviewMode';
import CodingMode from './coding/CodingMode';
import SettingsPanel from './settings/SettingsPanel';

export default function Overlay() {
  const { mode, settings, settingsOpen } = useAppStore();

  const themeClasses =
    settings.theme === 'dark'
      ? 'bg-gray-900/95 text-gray-100'
      : settings.theme === 'light'
        ? 'bg-white/95 text-gray-900'
        : 'bg-gray-900/80 text-gray-100';

  return (
    <div
      className={`relative flex flex-col w-full h-screen rounded-xl overflow-hidden border border-white/10 ${themeClasses}`}
    >
      <TitleBar />
      <ModeTabs />

      {/* Main content area */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'interview' ? <InterviewMode /> : <CodingMode />}

        {/* Settings slide-over */}
        {settingsOpen && (
          <div className="absolute inset-0 z-50 bg-gray-900/98 overflow-y-auto">
            <SettingsPanel />
          </div>
        )}
      </div>

      <StatusBar />
    </div>
  );
}
