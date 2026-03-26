import type { AppSettings } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  // Profile
  resumePath: null,
  resumeParsed: null,
  jobDescription: '',
  additionalContext: '',

  // AI
  defaultLLM: 'openai',
  apiKeys: {
    deepgram: '',
    gemini: '',
    openai: '',
    anthropic: '',
  },
  responseStyle: 'detailed',
  responseTone: 'professional',

  // Coding
  preferredLanguage: 'python',
  codeIncludeComments: true,
  codeIncludeComplexity: true,
  codeIncludeEdgeCases: true,
  codeIncludeAlternatives: false,
  autoCaptureInterval: 2,

  // Audio
  audioSourceId: '',
  transcriptionLanguage: 'en',
  autoDetectQuestions: true,
  questionSensitivity: 60,

  // Overlay
  opacity: 85,
  position: 'top-right',
  size: 'medium',
  theme: 'dark',

  // Shortcuts
  shortcuts: {
    toggleVisibility: 'CommandOrControl+Shift+G',
    toggleListening: 'CommandOrControl+Shift+L',
    switchMode: 'CommandOrControl+Shift+M',
    copyLastAnswer: 'CommandOrControl+Shift+C',
    copyLastCode: 'CommandOrControl+Shift+K',
    panicHide: 'CommandOrControl+Shift+H',
  },
};

export const OVERLAY_SIZES = {
  small: { width: 320, height: 480 },
  medium: { width: 420, height: 600 },
  large: { width: 560, height: 720 },
} as const;

export const CODING_LANGUAGES = [
  { value: 'python', label: 'Python 3' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'php', label: 'PHP' },
  { value: 'sql', label: 'SQL' },
] as const;

export const TRANSCRIPTION_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'zh', label: 'Mandarin' },
  { value: 'de', label: 'German' },
  { value: 'fr', label: 'French' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ar', label: 'Arabic' },
] as const;
