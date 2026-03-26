import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/app-store';
import {
  startDeepgramTranscription,
  stopDeepgramTranscription,
} from '../services/deepgram';
import { detectQuestion } from '../services/question-detector';
import type { TranscriptEntry } from '../../shared/types';

export function useTranscription() {
  const isListening = useAppStore((s) => s.isListening);
  const setListening = useAppStore((s) => s.setListening);
  const deepgramKey = useAppStore((s) => s.settings.apiKeys.deepgram);
  const language = useAppStore((s) => s.settings.transcriptionLanguage);

  const interimIdRef = useRef<string | null>(null);
  const stoppingRef = useRef(false); // Prevent disconnect → setListening(false) loop

  useEffect(() => {
    if (!isListening) {
      stoppingRef.current = true;
      stopDeepgramTranscription();
      stoppingRef.current = false;
      return;
    }

    if (!deepgramKey) {
      console.warn('[GhostMic] No Deepgram API key — cannot start listening');
      // Don't call setListening(false) here; the key might load in a moment
      return;
    }

    stoppingRef.current = false;

    const onTranscript = (entry: TranscriptEntry) => {
      const store = useAppStore.getState();

      if (!entry.isFinal) {
        if (interimIdRef.current) {
          store.updateTranscriptEntry(interimIdRef.current, { text: entry.text });
        } else {
          const id = `interim-${Date.now()}`;
          interimIdRef.current = id;
          store.addTranscriptEntry({ ...entry, id });
        }
        return;
      }

      // Final result — clear interim
      if (interimIdRef.current) {
        store.updateTranscriptEntry(interimIdRef.current, { text: '' });
        interimIdRef.current = null;
      }

      const sensitivity = store.settings.questionSensitivity;
      const detection = detectQuestion(entry.text, sensitivity);

      store.addTranscriptEntry({
        ...entry,
        isQuestion: detection.isQuestion,
      });

      if (detection.isQuestion) {
        console.log('[GhostMic] Question detected:', entry.text, 'confidence:', detection.confidence);
        window.dispatchEvent(
          new CustomEvent('ghostmic:question-detected', {
            detail: { text: entry.text, isCoding: detection.isCodingQuestion },
          })
        );
      }
    };

    startDeepgramTranscription(
      deepgramKey,
      language,
      onTranscript,
      (err) => {
        console.error('[GhostMic] Transcription error:', err);
        // Only reset listening if we weren't intentionally stopping
        if (!stoppingRef.current) {
          useAppStore.getState().setListening(false);
        }
      },
      () => {
        console.log('[GhostMic] Deepgram connected — listening');
      },
      () => {
        console.log('[GhostMic] Deepgram disconnected');
        // Don't auto-set listening to false on disconnect —
        // could be a normal cleanup from the effect
      }
    );

    return () => {
      stoppingRef.current = true;
      stopDeepgramTranscription();
    };
  }, [isListening, deepgramKey, language]);

  return { isListening, setListening };
}
