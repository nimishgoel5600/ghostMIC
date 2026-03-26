import React from 'react';
import { useAppStore } from '../../store/app-store';
import { OVERLAY_SIZES } from '../../../shared/constants';
import type { OverlayPosition, OverlaySize, OverlayTheme } from '../../../shared/types';

export default function OverlaySettings() {
  const { settings, setSettings } = useAppStore();

  const update = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    setSettings({ [key]: value });
    window.electronAPI.setSettings({ [key]: value });

    // Apply immediately
    if (key === 'opacity') {
      window.electronAPI.setOpacity(value as number);
    }
    if (key === 'size') {
      const s = OVERLAY_SIZES[value as OverlaySize];
      window.electronAPI.setWindowSize(s.width, s.height);
    }
  };

  return (
    <div className="space-y-4">
      {/* Opacity */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Opacity: {settings.opacity}%
        </label>
        <input
          type="range"
          min={30}
          max={100}
          step={5}
          value={settings.opacity}
          onChange={(e) => update('opacity', parseInt(e.target.value))}
          className="w-full h-1 accent-green-500"
        />
      </div>

      {/* Position */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Position
        </label>
        <select
          value={settings.position}
          onChange={(e) => update('position', e.target.value as OverlayPosition)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="center-right">Center Right</option>
          <option value="center-left">Center Left</option>
          <option value="free">Free (draggable)</option>
        </select>
      </div>

      {/* Size */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Size
        </label>
        <select
          value={settings.size}
          onChange={(e) => update('size', e.target.value as OverlaySize)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          <option value="small">Small (320px)</option>
          <option value="medium">Medium (420px)</option>
          <option value="large">Large (560px)</option>
        </select>
      </div>

      {/* Theme */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) => update('theme', e.target.value as OverlayTheme)}
          className="w-full px-2 py-1.5 bg-gray-800 border border-white/10 rounded text-xs text-gray-300 outline-none focus:border-green-500/30"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="transparent">Transparent</option>
        </select>
      </div>

      {/* Shortcuts info */}
      <div>
        <label className="block text-[10px] font-medium text-gray-400 mb-1">
          Keyboard Shortcuts
        </label>
        <div className="space-y-1 text-[10px] text-gray-500">
          {Object.entries(settings.shortcuts).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-400">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
              </span>
              <span className="font-mono text-gray-600">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
