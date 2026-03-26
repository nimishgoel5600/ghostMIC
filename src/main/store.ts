import Store from 'electron-store';
import { app } from 'electron';
import path from 'path';
import { config } from 'dotenv';
import { DEFAULT_SETTINGS } from '../shared/constants';
import type { AppSettings } from '../shared/types';

// Load .env from project root
const envPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join(app.getAppPath(), '.env');

config({ path: envPath });

const store = new Store<AppSettings>({
  name: 'ghostmic-settings',
  defaults: DEFAULT_SETTINGS,
});

// Always sync .env keys into the store on launch.
// .env is the source of truth for API keys.
const envApiKeys = {
  deepgram: process.env.DEEPGRAM_API_KEY || '',
  gemini: process.env.GEMINI_API_KEY || '',
  openai: process.env.OPENAI_API_KEY || '',
  anthropic: process.env.ANTHROPIC_API_KEY || '',
};

// Overwrite stored keys with .env keys (if .env key is set)
const storedKeys = store.get('apiKeys') || { ...DEFAULT_SETTINGS.apiKeys };
for (const key of ['deepgram', 'gemini', 'openai', 'anthropic'] as const) {
  if (envApiKeys[key]) {
    storedKeys[key] = envApiKeys[key];
  }
}
store.set('apiKeys', storedKeys);

// If the stored defaultLLM has no key but another provider does, switch
const currentLLM = store.get('defaultLLM');
if (!storedKeys[currentLLM === 'gemini' ? 'gemini' : currentLLM === 'openai' ? 'openai' : 'anthropic']) {
  for (const p of ['openai', 'anthropic', 'gemini'] as const) {
    if (storedKeys[p]) {
      store.set('defaultLLM', p);
      console.log('[GhostMic] Switched default LLM to', p, '(previous had no key)');
      break;
    }
  }
}

console.log('[GhostMic] LLM:', store.get('defaultLLM'),
  '| Keys: deepgram:', storedKeys.deepgram ? 'OK' : 'MISSING',
  'gemini:', storedKeys.gemini ? 'OK' : 'MISSING',
  'openai:', storedKeys.openai ? 'OK' : 'MISSING',
  'anthropic:', storedKeys.anthropic ? 'OK' : 'MISSING',
);

export function getSettings(): AppSettings {
  return store.store;
}

export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
  return store.get(key);
}

export function setSettings(partial: Partial<AppSettings>): void {
  for (const [key, value] of Object.entries(partial)) {
    store.set(key as keyof AppSettings, value);
  }
}

export function setSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): void {
  store.set(key, value);
}

export { store };
