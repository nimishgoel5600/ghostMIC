import React, { useState } from 'react';
import { useAppStore } from '../../store/app-store';
import type { LLMProvider, ResponseStyle, ResponseTone } from '../../../shared/types';

export default function AISettings() {
  const { settings, setSettings } = useAppStore();

  const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings({ [key]: value });
    window.electronAPI.setSettings({ [key]: value });
  };

  const updateApiKey = (provider: keyof typeof settings.apiKeys, value: string) => {
    const keys = { ...settings.apiKeys, [provider]: value };
    setSettings({ apiKeys: keys });
    window.electronAPI.setSettings({ apiKeys: keys });
  };

  const keyStatus = (key: string) =>
    key.length > 5 ? (
      <span className="text-green-500 text-[9px]">●</span>
    ) : (
      <span className="text-red-500 text-[9px]">●</span>
    );

  return (
    <div className="space-y-4">
      {/* Default LLM */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Default LLM
        </label>
        <select
          value={settings.defaultLLM}
          onChange={(e) => updateSetting('defaultLLM', e.target.value as LLMProvider)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          <option value="gemini">Gemini 2.0 Flash (fast, free tier)</option>
          <option value="openai">GPT-4o (premium)</option>
          <option value="anthropic">Claude Sonnet (premium)</option>
        </select>
      </div>

      {/* API Keys */}
      <div className="space-y-2">
        <label className="block text-[10px] font-medium text-gray-400">API Keys</label>

        {(['deepgram', 'gemini', 'openai', 'anthropic'] as const).map((provider) => (
          <div key={provider} className="flex items-center gap-2">
            {keyStatus(settings.apiKeys[provider])}
            <input
              type="password"
              value={settings.apiKeys[provider]}
              onChange={(e) => updateApiKey(provider, e.target.value)}
              placeholder={`${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key`}
              className="flex-1 px-2 py-1 bg-gray-800 border border-white/10 rounded text-[10px] text-gray-300 placeholder-gray-600 outline-none focus:border-green-500/30"
            />
          </div>
        ))}
      </div>

      {/* Response Style */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Response Style
        </label>
        <select
          value={settings.responseStyle}
          onChange={(e) => updateSetting('responseStyle', e.target.value as ResponseStyle)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          <option value="concise">Concise (2-3 sentences)</option>
          <option value="detailed">Detailed (STAR format)</option>
          <option value="expert">Expert (comprehensive)</option>
        </select>
      </div>

      {/* Response Tone */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Response Tone
        </label>
        <select
          value={settings.responseTone}
          onChange={(e) => updateSetting('responseTone', e.target.value as ResponseTone)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          <option value="professional">Professional</option>
          <option value="conversational">Conversational</option>
          <option value="technical">Technical</option>
        </select>
      </div>
    </div>
  );
}
