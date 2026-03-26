import React from 'react';
import { useAppStore } from '../../store/app-store';
import { CODING_LANGUAGES } from '../../../shared/constants';
import type { CodingLanguage } from '../../../shared/types';

export default function LanguageSelector() {
  const { settings, setSettings } = useAppStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as CodingLanguage;
    setSettings({ preferredLanguage: lang });
    window.electronAPI.setSettings({ preferredLanguage: lang });
  };

  return (
    <select
      value={settings.preferredLanguage}
      onChange={handleChange}
      className="bg-gray-800 text-gray-300 text-[10px] border border-white/10 rounded px-2 py-0.5 outline-none focus:border-cyan-500/50"
    >
      {CODING_LANGUAGES.map((lang) => (
        <option key={lang.value} value={lang.value}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
