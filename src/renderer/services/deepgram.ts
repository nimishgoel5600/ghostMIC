import type { TranscriptEntry } from '../../shared/types';
import { useAppStore } from '../store/app-store';

type TranscriptCallback = (entry: TranscriptEntry) => void;

let socket: WebSocket | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioStream: MediaStream | null = null;
let entryCounter = 0;
let capturing = false; // prevent duplicate capture attempts

/**
 * Try to get system audio (what plays through speakers = interviewer's voice).
 * Falls back to microphone if system audio isn't available.
 */
async function getAudioStream(): Promise<{ stream: MediaStream; type: 'system' | 'mic' }> {

  // ─── Attempt 1: getDisplayMedia for system audio loopback ──
  // The main process handler auto-approves with audio:'loopback'
  try {
    console.log('[GhostMic] Trying system audio via getDisplayMedia...');
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true, // Electron requires video in the request
    });

    // Discard video tracks — we only want system audio
    stream.getVideoTracks().forEach(track => {
      track.stop();
      stream.removeTrack(track);
    });

    if (stream.getAudioTracks().length > 0) {
      console.log('[GhostMic] ✓ System audio captured (interviewer only)');
      return { stream, type: 'system' };
    }
  } catch (err) {
    console.warn('[GhostMic] getDisplayMedia failed:', (err as Error).message);
  }

  // ─── Attempt 2: Electron desktop audio via getUserMedia ────
  try {
    console.log('[GhostMic] Trying desktop audio via getUserMedia...');
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        // @ts-expect-error Electron-specific
        mandatory: { chromeMediaSource: 'desktop' },
      },
      video: {
        // @ts-expect-error Electron-specific
        mandatory: { chromeMediaSource: 'desktop', maxWidth: 1, maxHeight: 1, maxFrameRate: 1 },
      },
    });

    stream.getVideoTracks().forEach(track => {
      track.stop();
      stream.removeTrack(track);
    });

    if (stream.getAudioTracks().length > 0) {
      console.log('[GhostMic] ✓ Desktop audio captured (interviewer only)');
      return { stream, type: 'system' };
    }
  } catch (err) {
    console.warn('[GhostMic] Desktop getUserMedia failed:', (err as Error).message);
  }

  // ─── Attempt 3: Microphone fallback ────────────────────────
  console.warn('[GhostMic] ⚠ Falling back to microphone — will capture YOUR voice too.');
  console.warn('[GhostMic] To capture only interviewer: enable Electron.app in');
  console.warn('[GhostMic]   System Settings → Privacy → Screen & System Audio Recording');
  console.warn('[GhostMic]   AND in "System Audio Recording Only" section, then restart.');

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });

  return { stream, type: 'mic' };
}

export function startDeepgramTranscription(
  apiKey: string,
  language: string,
  onTranscript: TranscriptCallback,
  onError: (err: string) => void,
  onConnected: () => void,
  onDisconnected: () => void
): void {
  if (socket || capturing) {
    stopDeepgramTranscription();
  }

  capturing = true;

  getAudioStream()
    .then(({ stream, type }) => {
      if (!capturing) { // stopped while awaiting
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      audioStream = stream;

      // Report audio type to the UI store
      useAppStore.getState().setAudioType(type);

      if (type === 'mic') {
        console.log('[GhostMic] Using MICROPHONE (fallback) — interviewer + your voice');
      }

      // Connect to Deepgram with speaker diarization enabled
      const url = `wss://api.deepgram.com/v1/listen?model=nova-2&language=${language}&smart_format=true&interim_results=true&endpointing=300&diarize=true`;
      socket = new WebSocket(url, ['token', apiKey]);

      socket.onopen = () => {
        console.log('[GhostMic] Deepgram connected — audio type:', type);
        onConnected();

        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket?.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };

        mediaRecorder.start(250);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'Results') {
            const alt = data.channel?.alternatives?.[0];
            if (!alt?.transcript) return;
            const transcript = alt.transcript.trim();
            if (!transcript) return;

            // Get speaker ID from diarization
            const speakerId = alt.words?.[0]?.speaker?.toString() || null;
            const userSpeaker = useAppStore.getState().userSpeaker;
            const isUser = speakerId !== null && speakerId === userSpeaker;

            onTranscript({
              id: data.is_final ? `final-${++entryCounter}` : 'interim',
              text: transcript,
              timestamp: Date.now(),
              isFinal: data.is_final,
              isQuestion: false,
              speaker: speakerId ?? undefined,
              isUser,
            });
          }
        } catch (err) {
          console.error('[GhostMic] Deepgram parse error:', err);
        }
      };

      socket.onerror = () => {
        onError('Deepgram connection error — check API key');
      };

      socket.onclose = (event) => {
        console.log('[GhostMic] Deepgram closed:', event.code);
        onDisconnected();
        socket = null;
      };
    })
    .catch((err) => {
      capturing = false;
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[GhostMic] All audio capture failed:', msg);
      onError('Audio capture failed: ' + msg);
    });
}

export function stopDeepgramTranscription(): void {
  capturing = false;

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop(); } catch { /* */ }
    mediaRecorder = null;
  }

  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop());
    audioStream = null;
  }

  if (socket) {
    if (socket.readyState === WebSocket.OPEN) {
      try { socket.send(JSON.stringify({ type: 'CloseStream' })); } catch { /* */ }
      socket.close();
    }
    socket = null;
  }
}

export function isConnected(): boolean {
  return socket?.readyState === WebSocket.OPEN;
}
