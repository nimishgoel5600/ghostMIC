import Tesseract from 'tesseract.js';

let worker: Tesseract.Worker | null = null;
let lastTextHash = '';

async function getWorker(): Promise<Tesseract.Worker> {
  if (!worker) {
    worker = await Tesseract.createWorker('eng');
  }
  return worker;
}

export async function extractTextFromImage(imageDataUrl: string): Promise<string> {
  const w = await getWorker();
  const result = await w.recognize(imageDataUrl);
  return result.data.text;
}

/**
 * Returns the OCR text only if it differs significantly from the last capture.
 * This avoids re-processing identical screens.
 */
export async function extractTextIfChanged(imageDataUrl: string): Promise<string | null> {
  const text = await extractTextFromImage(imageDataUrl);

  // Simple hash to detect changes
  const hash = simpleHash(text.trim());
  if (hash === lastTextHash) {
    return null; // No significant change
  }

  lastTextHash = hash;
  return text;
}

function simpleHash(str: string): string {
  // Strip whitespace for comparison
  const normalized = str.replace(/\s+/g, ' ').trim();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString(36);
}

export async function terminateOCR(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
