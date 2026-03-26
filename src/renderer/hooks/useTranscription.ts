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
  const stoppingRef = useRef(false);

  useEffect(() => {
    if (!isListening) {
      stoppingRef.current = true;
      stopDeepgramTranscription();
      stoppingRef.current = false;
      return;
    }

    if (!deepgramKey) {
      console.warn('[GhostMic] No Deepgram API key');
      return;
    }

    stoppingRef.current = false;

    const onTranscript = (entry: TranscriptEntry) => {
      const store = useAppStore.getState();

      if (!entry.isFinal) {
        if (interimIdRef.current) {
          store.updateTranscriptEntry(interimIdRef.current, {
            text: entry.text,
            speaker: entry.speaker,
            isUser: entry.isUser,
          });
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

      // Run question detection
      const sensitivity = store.settings.questionSensitivity;
      const detection = detectQuestion(entry.text, sensitivity);

      store.addTranscriptEntry({
        ...entry,
        isQuestion: entry.isUser ? false : detection.isQuestion, // Never mark user's own speech as question
      });

      // ONLY trigger AI answers for INTERVIEWER's speech, NOT yours
      if (detection.isQuestion && !entry.isUser) {
        console.log('[GhostMic] Interviewer question (speaker', entry.speaker + '):', entry.text.substring(0, 50));
        window.dispatchEvent(
          new CustomEvent('ghostmic:question-detected', {
            detail: { text: entry.text, isCoding: detection.isCodingQuestion },
          })
        );
      } else if (entry.isUser && detection.isQuestion) {
        console.log('[GhostMic] Skipping YOUR speech (speaker', entry.speaker + '):', entry.text.substring(0, 50));
      }
    };

    startDeepgramTranscription(
      deepgramKey,
      language,
      onTranscript,
      (err) => {
        console.error('[GhostMic] Transcription error:', err);
        if (!stoppingRef.current) {
          useAppStore.getState().setListening(false);
        }
      },
      () => console.log('[GhostMic] Deepgram connected — listening with diarization'),
      () => console.log('[GhostMic] Deepgram disconnected')
    );

    return () => {
      stoppingRef.current = true;
      stopDeepgramTranscription();
    };
  }, [isListening, deepgramKey, language]);

  return { isListening, setListening };
}
