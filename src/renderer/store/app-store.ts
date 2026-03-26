import { create } from 'zustand';
import type {
  AppMode,
  AppSettings,
  TranscriptEntry,
  QAPair,
  CodingProblem,
  CodingSolution,
} from '../../shared/types';
import { DEFAULT_SETTINGS } from '../../shared/constants';

interface AppState {
  // Mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;

  // Settings
  settings: AppSettings;
  setSettings: (partial: Partial<AppSettings>) => void;
  settingsOpen: boolean;
  toggleSettings: () => void;

  // Audio / Transcription
  isListening: boolean;
  setListening: (val: boolean) => void;
  transcript: TranscriptEntry[];
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  updateTranscriptEntry: (id: string, update: Partial<TranscriptEntry>) => void;
  clearTranscript: () => void;

  // Interview
  qaPairs: QAPair[];
  addQAPair: (pair: QAPair) => void;
  currentAnswer: string;
  setCurrentAnswer: (answer: string) => void;
  isGenerating: boolean;
  setGenerating: (val: boolean) => void;

  // Coding
  currentProblem: CodingProblem | null;
  setCurrentProblem: (problem: CodingProblem | null) => void;
  currentSolution: CodingSolution | null;
  setCurrentSolution: (solution: CodingSolution | null) => void;
  isSolving: boolean;
  setSolving: (val: boolean) => void;
  currentCode: string;
  setCurrentCode: (code: string) => void;

  // Screen capture
  isCapturing: boolean;
  setCapturing: (val: boolean) => void;
  lastScreenshot: string | null;
  setLastScreenshot: (data: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Mode
  mode: 'interview',
  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((state) => ({ mode: state.mode === 'interview' ? 'coding' : 'interview' })),

  // Settings
  settings: DEFAULT_SETTINGS,
  setSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  settingsOpen: false,
  toggleSettings: () => set((state) => ({ settingsOpen: !state.settingsOpen })),

  // Audio
  isListening: false,
  setListening: (val) => set({ isListening: val }),
  transcript: [],
  addTranscriptEntry: (entry) =>
    set((state) => ({ transcript: [...state.transcript, entry] })),
  updateTranscriptEntry: (id, update) =>
    set((state) => ({
      transcript: state.transcript.map((t) =>
        t.id === id ? { ...t, ...update } : t
      ),
    })),
  clearTranscript: () => set({ transcript: [] }),

  // Interview
  qaPairs: [],
  addQAPair: (pair) => set((state) => ({ qaPairs: [pair, ...state.qaPairs] })),
  currentAnswer: '',
  setCurrentAnswer: (answer) => set({ currentAnswer: answer }),
  isGenerating: false,
  setGenerating: (val) => set({ isGenerating: val }),

  // Coding
  currentProblem: null,
  setCurrentProblem: (problem) => set({ currentProblem: problem }),
  currentSolution: null,
  setCurrentSolution: (solution) => set({ currentSolution: solution }),
  isSolving: false,
  setSolving: (val) => set({ isSolving: val }),
  currentCode: '',
  setCurrentCode: (code) => set({ currentCode: code }),

  // Screen capture
  isCapturing: false,
  setCapturing: (val) => set({ isCapturing: val }),
  lastScreenshot: null,
  setLastScreenshot: (data) => set({ lastScreenshot: data }),
}));
