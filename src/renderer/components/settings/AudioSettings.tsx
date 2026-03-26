import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/app-store';
import { TRANSCRIPTION_LANGUAGES } from '../../../shared/constants';

export default function AudioSettings() {
  const { settings, setSettings } = useAppStore();
  const [audioSources, setAudioSources] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    window.electronAPI.getAudioSources().then(setAudioSources);
  }, []);

  const update = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings({ [key]: value });
    window.electronAPI.setSettings({ [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Audio Source */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Audio Source
        </label>
        <select
          value={settings.audioSourceId}
          onChange={(e) => update('audioSourceId', e.target.value)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          <option value="">System Audio (default)</option>
          {audioSources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
        <p className="text-[9px] text-gray-600 mt-1">
          macOS: Requires BlackHole or similar virtual audio device for system audio capture.
        </p>
      </div>

      {/* Transcription Language */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Transcription Language
        </label>
        <select
          value={settings.transcriptionLanguage}
          onChange={(e) => update('transcriptionLanguage', e.target.value)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          {TRANSCRIPTION_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Auto-detect Questions */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Auto-detect questions</span>
        <div
          onClick={() => update('autoDetectQuestions', !settings.autoDetectQuestions)}
          className={`w-7 h-4 rounded-full relative transition-colors cursor-pointer ${
            settings.autoDetectQuestions ? 'bg-green-500' : 'bg-gray-700'
          }`}
        >
          <div
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
              settings.autoDetectQuestions ? 'translate-x-3.5' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>

      {/* Sensitivity */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Question Detection Sensitivity: {settings.questionSensitivity}%
        </label>
        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={settings.questionSensitivity}
          onChange={(e) => update('questionSensitivity', parseInt(e.target.value))}
          className="w-full h-1 accent-green-500"
        />
        <div className="flex justify-between text-[9px] text-gray-600">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
