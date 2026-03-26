import { useEffect, useCallback } from 'react';
import { useAppStore } from '../store/app-store';
import { extractTextIfChanged } from '../services/ocr';
import { detectCodingProblem } from '../services/coding-detector';

export function useScreenCapture() {
  const {
    isCapturing,
    settings,
    setLastScreenshot,
    setCurrentProblem,
    currentProblem,
  } = useAppStore();

  const processScreenshot = useCallback(
    async (imageData: string) => {
      setLastScreenshot(imageData);

      try {
        // OCR — only process if content changed
        const text = await extractTextIfChanged(imageData);
        if (!text) return; // No change

        // Detect coding problem
        const problem = await detectCodingProblem(text, settings);
        if (problem && problem.title !== currentProblem?.title) {
          setCurrentProblem(problem);

          // Auto-trigger solve via custom event
          window.dispatchEvent(
            new CustomEvent('ghostmic:problem-detected', { detail: problem })
          );
        }
      } catch (err) {
        console.error('Screen capture processing error:', err);
      }
    },
    [settings, currentProblem, setLastScreenshot, setCurrentProblem]
  );

  // Listen for screenshots from main process
  useEffect(() => {
    if (!isCapturing) return;

    const unsub = window.electronAPI.onScreenCapture(
      (data: { imageData: string }) => {
        processScreenshot(data.imageData);
      }
    );

    return unsub;
  }, [isCapturing, processScreenshot]);

  return { isCapturing };
}
