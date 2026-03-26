import React, { useState } from 'react';
import { useAppStore } from '../../store/app-store';
import ProfileSettings from './ProfileSettings';
import AISettings from './AISettings';
import CodingSettings from './CodingSettings';
import AudioSettings from './AudioSettings';
import OverlaySettings from './OverlaySettings';

type SettingsTab = 'profile' | 'ai' | 'coding' | 'audio' | 'overlay';

const tabs: { key: SettingsTab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'ai', label: 'AI' },
  { key: 'coding', label: 'Coding' },
  { key: 'audio', label: 'Audio' },
  { key: 'overlay', label: 'Overlay' },
];

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { toggleSettings } = useAppStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-xs font-bold text-gray-300">Settings</span>
        <button
          onClick={toggleSettings}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-2 py-1.5 text-[10px] font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-green-400 border-b border-green-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'ai' && <AISettings />}
        {activeTab === 'coding' && <CodingSettings />}
        {activeTab === 'audio' && <AudioSettings />}
        {activeTab === 'overlay' && <OverlaySettings />}
      </div>
    </div>
  );
}
