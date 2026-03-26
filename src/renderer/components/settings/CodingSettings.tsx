import React from 'react';
import { useAppStore } from '../../store/app-store';
import { CODING_LANGUAGES } from '../../../shared/constants';
import type { CodingLanguage } from '../../../shared/types';

export default function CodingSettings() {
  const { settings, setSettings } = useAppStore();

  const update = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings({ [key]: value });
    window.electronAPI.setSettings({ [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Preferred Language */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Preferred Language
        </label>
        <select
          value={settings.preferredLanguage}
          onChange={(e) => update('preferredLanguage', e.target.value as CodingLanguage)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          {CODING_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Code Style Toggles */}
      <div className="space-y-2">
        <label className="block text-[10px] font-medium text-gray-400">Code Style</label>

        <Toggle
          label="Include comments"
          checked={settings.codeIncludeComments}
          onChange={(v) => update('codeIncludeComments', v)}
        />
        <Toggle
          label="Include complexity analysis"
          checked={settings.codeIncludeComplexity}
          onChange={(v) => update('codeIncludeComplexity', v)}
        />
        <Toggle
          label="Include edge cases"
          checked={settings.codeIncludeEdgeCases}
          onChange={(v) => update('codeIncludeEdgeCases', v)}
        />
        <Toggle
          label="Include alternative approaches"
          checked={settings.codeIncludeAlternatives}
          onChange={(v) => update('codeIncludeAlternatives', v)}
        />
      </div>

      {/* Auto-capture Interval */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Screen Capture Interval: {settings.autoCaptureInterval}s
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={0.5}
          value={settings.autoCaptureInterval}
          onChange={(e) => update('autoCaptureInterval', parseFloat(e.target.value))}
          className="w-full h-1 accent-cyan-500"
        />
        <div className="flex justify-between text-[9px] text-gray-600">
          <span>1s</span>
          <span>5s</span>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-[10px] text-gray-400">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`w-7 h-4 rounded-full relative transition-colors cursor-pointer ${
          checked ? 'bg-green-500' : 'bg-gray-700'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-3.5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </label>
  );
}
