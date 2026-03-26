// ─── LLM Provider ────────────────────────────────────────────
export type LLMProvider = 'gemini' | 'openai' | 'anthropic';

// ─── Response Style / Tone ───────────────────────────────────
export type ResponseStyle = 'concise' | 'detailed' | 'expert';
export type ResponseTone = 'professional' | 'conversational' | 'technical';

// ─── Coding Languages ────────────────────────────────────────
export type CodingLanguage =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'php'
  | 'sql';

// ─── Overlay ─────────────────────────────────────────────────
export type OverlayPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'center-right'
  | 'center-left'
  | 'free';

export type OverlaySize = 'small' | 'medium' | 'large';
export type OverlayTheme = 'dark' | 'light' | 'transparent';

// ─── App Mode ────────────────────────────────────────────────
export type AppMode = 'interview' | 'coding';

// ─── Settings ────────────────────────────────────────────────
export interface AppSettings {
  // Profile
  resumePath: string | null;
  resumeParsed: ParsedResume | null;
  jobDescription: string;
  additionalContext: string;

  // AI
  defaultLLM: LLMProvider;
  apiKeys: {
    deepgram: string;
    gemini: string;
    openai: string;
    anthropic: string;
  };
  responseStyle: ResponseStyle;
  responseTone: ResponseTone;

  // Coding
  preferredLanguage: CodingLanguage;
  codeIncludeComments: boolean;
  codeIncludeComplexity: boolean;
  codeIncludeEdgeCases: boolean;
  codeIncludeAlternatives: boolean;
  autoCaptureInterval: number; // seconds

  // Audio
  audioSourceId: string;
  transcriptionLanguage: string;
  autoDetectQuestions: boolean;
  questionSensitivity: number; // 0-100

  // Overlay
  opacity: number; // 30-100
  position: OverlayPosition;
  size: OverlaySize;
  theme: OverlayTheme;

  // Shortcuts
  shortcuts: {
    toggleVisibility: string;
    toggleListening: string;
    switchMode: string;
    copyLastAnswer: string;
    copyLastCode: string;
    panicHide: string;
  };
}

// ─── Resume ──────────────────────────────────────────────────
export interface ParsedResume {
  name: string;
  contact: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: string[];
  raw: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  dates: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

// ─── Transcription ───────────────────────────────────────────
export interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: number;
  isFinal: boolean;
  isQuestion: boolean;
  speaker?: string;
}

// ─── Interview Q&A ───────────────────────────────────────────
export interface QAPair {
  id: string;
  question: string;
  answer: string;
  model: LLMProvider;
  timestamp: number;
  responseTime: number;
  referencedSections: string[];
}

// ─── Coding Problem ──────────────────────────────────────────
export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  constraints: string;
  examples: { input: string; output: string; explanation: string }[];
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Unknown';
  platform: string;
  source: 'screen' | 'audio' | 'hybrid';
  timestamp: number;
}

export interface CodingSolution {
  id: string;
  problemId: string;
  understanding: string;
  approach: string;
  code: string;
  language: CodingLanguage;
  timeComplexity: string;
  spaceComplexity: string;
  edgeCases: string[];
  model: LLMProvider;
  solveTime: number;
}

// ─── IPC Channels ────────────────────────────────────────────
export interface IpcChannels {
  // Main → Renderer
  'transcript-update': TranscriptEntry;
  'audio-status': { connected: boolean; source: string };
  'screen-capture': { imageData: string };
  'shortcut-triggered': string;
  'settings-updated': Partial<AppSettings>;

  // Renderer → Main
  'start-audio': { sourceId: string };
  'stop-audio': void;
  'start-screen-capture': { interval: number };
  'stop-screen-capture': void;
  'get-audio-sources': void;
  'audio-sources-result': { id: string; name: string }[];
  'get-settings': void;
  'set-settings': Partial<AppSettings>;
  'upload-resume': { filePath: string };
  'parse-resume-result': ParsedResume;
  'toggle-visibility': void;
  'set-opacity': number;
  'set-window-size': { width: number; height: number };
  'minimize-to-tray': void;
}
