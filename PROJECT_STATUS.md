# GhostMic — Project Status & Summary

## What Is GhostMic?
An invisible Electron desktop overlay app that acts as an AI interview copilot and coding assistant. It sits on top of Zoom/Teams/Meet calls, transcribes the interviewer's voice in real-time, detects questions, and generates AI-powered answers.

---

## Tech Stack
- **Electron 34** — desktop app shell
- **React 19 + Vite** — renderer/UI
- **TypeScript** — throughout
- **Tailwind CSS v4** — styling
- **Zustand** — state management
- **Deepgram Nova-2** — real-time speech-to-text (WebSocket streaming)
- **OpenAI GPT-4o** — default LLM (Gemini free tier exhausted)
- **Google Gemini 2.0 Flash** — available as fallback
- **Anthropic Claude Sonnet** — available as fallback
- **Tesseract.js** — local OCR for screen capture
- **electron-store** — persistent settings
- **dotenv** — API key management via `.env`

---

## What's Working

### ✅ Electron Shell & Overlay
- Transparent, frameless, always-on-top overlay window
- Draggable title bar, resizable from edges
- System tray icon with show/hide/quit menu
- macOS dock hidden (stealth)
- Visible on all virtual desktops/spaces
- Global keyboard shortcuts (Cmd+Shift+G toggle, Cmd+Shift+L listen, Cmd+Shift+H panic hide)
- Single instance lock (only one app at a time)
- Dark theme UI with green (interview) / cyan (coding) accents
- Content protection toggle (disabled for debugging, enable for production)

### ✅ Settings System
- All settings persist across sessions via electron-store
- Settings panel with 5 tabs: Profile, AI, Coding, Audio, Overlay
- API keys loaded from `.env` file on startup (source of truth)
- Live settings changes without restart
- Resume upload support (PDF via pdf-parse, DOCX via mammoth)
- Job description paste/edit
- Additional context text area
- LLM model selector (Gemini/GPT-4o/Claude)
- Response style & tone selectors
- Coding language selector (13 languages)
- Opacity, position, size, theme controls

### ✅ Audio Capture & Transcription
- System audio capture via `getDisplayMedia()` + `setDisplayMediaRequestHandler`
- Main process auto-approves with `audio: 'loopback'` (no picker dialog)
- Captures what plays through speakers (interviewer's voice from Zoom/Teams)
- Fallback chain: system audio → desktop audio → microphone (last resort)
- Real-time streaming to Deepgram Nova-2 via WebSocket
- Live transcript display with auto-scroll
- Interim (gray italic) and final (white) results distinguished
- macOS permissions: Microphone + Screen & System Audio Recording

### ✅ Question Detection
- NLP-based detection on every final transcript entry
- Checks: question marks, question words, imperative patterns, length heuristics
- Configurable sensitivity slider (10-100%)
- Detected questions highlighted in yellow in transcript
- Manual "Answer" button on hover for any transcript line

### ✅ AI Answer Generation (Interview Mode)
- Unified LLM service supporting Gemini, GPT-4o, Claude with streaming
- Automatic LLM fallback: if default fails (e.g., rate limited), tries next configured provider
- Context-aware prompts: injects resume, job description, conversation history
- Streaming token-by-token display in the Answer Panel
- Conversation history (last 5 Q&A) fed into context for continuity
- Copy button on each answer
- Model label + response time shown per answer
- Error messages displayed in red in the answer panel

### ✅ Coding Mode (UI Built)
- Tab switching between Interview and Coding modes
- Problem panel: shows detected problem title, description, difficulty badge, platform, tags
- Solution panel: collapsible sections (Understanding, Approach, Code, Complexity, Edge Cases)
- Syntax-displayed code blocks with Copy Code / Copy All buttons
- Language selector dropdown (triggers re-solve in new language)
- Screen capture start/stop button

### ✅ Coding Mode — Backend Services (Built, Not Yet Tested End-to-End)
- Screen capture via `desktopCapturer` at configurable intervals
- Tesseract.js OCR with change detection (only reprocesses changed screens)
- LLM-based coding problem detection from OCR text
- Structured problem parsing (title, description, examples, constraints)
- Code solver with full prompt (understanding, approach, code, complexity, edge cases)
- Voice-to-code detection from audio transcript
- Problem creation from verbal coding questions

---

## What Needs Testing / May Need Fixes

### ⚠️ AI Answers Not Appearing
- Transcript works, questions are detected
- LLM calls may be failing silently — need to check console logs
- AnswerPanel has been fixed to show "Waiting..." state and errors in red
- Manual "Answer" button added for testing — hover any transcript line

### ⚠️ System Audio vs Microphone
- System audio capture depends on macOS permissions
- Requires Electron.app enabled in: System Settings → Privacy → Screen & System Audio Recording
- Also enable in "System Audio Recording Only" section
- Falls back to microphone if permissions not granted (captures your voice too)
- Console logs indicate which method is active

### ⚠️ Coding Mode End-to-End
- All services are built but not tested in a live session
- Screen capture + OCR + problem detection pipeline needs real-world testing
- Voice-to-code switching needs testing

---

## File Structure (50 source files)

```
src/
├── main/                          # Electron main process
│   ├── index.ts                   # App entry, window, stealth, permissions, display media handler
│   ├── ipc-handlers.ts            # IPC between main ↔ renderer
│   ├── preload.ts                 # Context bridge (safe API exposure)
│   ├── store.ts                   # electron-store + .env key sync
│   ├── tray.ts                    # System tray menu
│   ├── shortcuts.ts               # Global keyboard shortcuts
│   ├── audio-capture.ts           # Desktop capturer sources
│   └── screen-capture.ts          # Screenshot capture for coding mode
│
├── renderer/                      # React UI
│   ├── App.tsx                    # Root component, hook initialization
│   ├── main.tsx                   # React entry point
│   ├── components/
│   │   ├── Overlay.tsx            # Main overlay container
│   │   ├── TitleBar.tsx           # Drag handle, LIVE button, timer, settings gear
│   │   ├── ModeTabs.tsx           # Interview / Coding tab switcher
│   │   ├── StatusBar.tsx          # Bottom status (model, resume, JD, audio)
│   │   ├── interview/
│   │   │   ├── InterviewMode.tsx  # Interview layout
│   │   │   ├── Transcript.tsx     # Live transcript + manual Answer buttons
│   │   │   ├── AnswerPanel.tsx    # AI answer display (streaming + errors)
│   │   │   └── AnswerCard.tsx     # Individual Q&A card with copy
│   │   ├── coding/
│   │   │   ├── CodingMode.tsx     # Coding layout + capture toggle
│   │   │   ├── ProblemPanel.tsx   # Detected problem display
│   │   │   ├── SolutionPanel.tsx  # Code solution with collapsible sections
│   │   │   ├── CodeBlock.tsx      # Syntax-highlighted code
│   │   │   └── LanguageSelector.tsx
│   │   └── settings/
│   │       ├── SettingsPanel.tsx   # 5-tab settings container
│   │       ├── ProfileSettings.tsx # Resume, JD, context
│   │       ├── AISettings.tsx      # Model, API keys, style/tone
│   │       ├── CodingSettings.tsx  # Language, code style toggles
│   │       ├── AudioSettings.tsx   # Source, language, sensitivity
│   │       └── OverlaySettings.tsx # Opacity, position, size, theme
│   ├── services/
│   │   ├── deepgram.ts            # System audio → Deepgram WebSocket
│   │   ├── llm.ts                 # Unified LLM interface with fallback
│   │   ├── gemini.ts              # Google Gemini streaming
│   │   ├── openai-service.ts      # OpenAI GPT-4o streaming
│   │   ├── anthropic.ts           # Claude streaming
│   │   ├── ocr.ts                 # Tesseract.js OCR
│   │   ├── question-detector.ts   # NLP question detection
│   │   ├── coding-detector.ts     # Coding problem detection
│   │   ├── problem-parser.ts      # Parse LLM solution response
│   │   ├── resume-parser.ts       # PDF/DOCX resume parsing
│   │   └── prompt-builder.ts      # Interview & coding prompt templates
│   ├── hooks/
│   │   ├── useTranscription.ts    # Deepgram lifecycle management
│   │   ├── useLLM.ts             # LLM answer/solve with event handling
│   │   ├── useScreenCapture.ts    # Screen capture + OCR pipeline
│   │   └── useKeyboardShortcuts.ts
│   ├── store/
│   │   ├── app-store.ts           # Zustand global state
│   │   └── types.ts               # Window type augmentation
│   └── styles/
│       └── globals.css             # Tailwind + animations
│
├── shared/
│   ├── types.ts                   # All TypeScript types
│   └── constants.ts               # Default settings, languages, etc.
│
└── types.d.ts                     # pdf-parse type declaration
```

---

## How to Run

```bash
# Install dependencies
npm install

# Build and launch (production)
npm start

# Development mode (Vite hot reload)
npm run dev
```

---

## API Keys Required (.env file)

| Key | Required | Purpose |
|-----|----------|---------|
| `DEEPGRAM_API_KEY` | Yes | Real-time speech-to-text |
| `GEMINI_API_KEY` | Optional | Gemini 2.0 Flash LLM |
| `OPENAI_API_KEY` | Yes (default) | GPT-4o LLM |
| `ANTHROPIC_API_KEY` | Optional | Claude Sonnet LLM |

---

## macOS Permissions Needed

1. **Microphone** — auto-prompted on first launch
2. **Screen & System Audio Recording** — enable Electron.app manually in System Settings
3. **System Audio Recording Only** — enable Electron.app (for interviewer-only audio)

Electron.app is located at:
```
node_modules/electron/dist/Electron.app
```
