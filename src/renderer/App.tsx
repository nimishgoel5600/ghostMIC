import React, { useEffect } from 'react';
import { useAppStore } from './store/app-store';
import Overlay from './components/Overlay';
import { useTranscription } from './hooks/useTranscription';
import { useLLM } from './hooks/useLLM';
import { useScreenCapture } from './hooks/useScreenCapture';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './store/types';

export default function App() {
  const setSettings = useAppStore((s) => s.setSettings);

  // Initialize all hooks
  useTranscription();
  useLLM();
  useScreenCapture();
  useKeyboardShortcuts();

  // Load settings from main process on mount
  useEffect(() => {
    window.electronAPI.getSettings().then((s) => {
      setSettings(s);
      console.log('[GhostMic] Settings loaded, LLM:', s.defaultLLM,
        'Deepgram key:', s.apiKeys?.deepgram ? 'set' : 'missing',
        'Gemini key:', s.apiKeys?.gemini ? 'set' : 'missing');
    });
  }, [setSettings]);

  // Listen for global shortcut events
  useEffect(() => {
    const unsub = window.electronAPI.onShortcutTriggered((action: string) => {
      const store = useAppStore.getState();
      switch (action) {
        case 'switchMode':
          store.toggleMode();
          break;
        case 'toggleListening':
          store.setListening(!store.isListening);
          break;
      }
    });
    return unsub;
  }, []);

  return <Overlay />;
}
