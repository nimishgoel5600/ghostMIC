import type { CodingProblem } from '../../shared/types';
import type { AppSettings } from '../../shared/types';
import { callLLM } from './llm';
import { buildProblemDetectionPrompt } from './prompt-builder';

let lastProblemHash = '';

export async function detectCodingProblem(
  ocrText: string,
  settings: AppSettings
): Promise<CodingProblem | null> {
  if (!ocrText || ocrText.trim().length < 30) {
    return null;
  }

  // Check if content changed significantly
  const hash = simpleHash(ocrText);
  if (hash === lastProblemHash) {
    return null;
  }

  try {
    const prompt = buildProblemDetectionPrompt(ocrText);
    const response = await callLLM(settings, 'You are a coding problem detector. Respond only with valid JSON.', prompt);

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.is_coding_problem) {
      return null;
    }

    lastProblemHash = hash;

    return {
      id: `problem-${Date.now()}`,
      title: parsed.title || 'Untitled Problem',
      description: parsed.description || '',
      constraints: parsed.constraints || '',
      examples: parsed.examples || [],
      tags: parsed.tags || [],
      difficulty: parsed.difficulty || 'Unknown',
      platform: parsed.platform_detected || 'Unknown',
      source: 'screen',
      timestamp: Date.now(),
    };
  } catch (err) {
    console.error('Problem detection error:', err);
    return null;
  }
}

export function createProblemFromAudio(
  transcriptText: string
): CodingProblem {
  return {
    id: `problem-audio-${Date.now()}`,
    title: extractTitleFromText(transcriptText),
    description: transcriptText,
    constraints: '',
    examples: [],
    tags: [],
    difficulty: 'Unknown',
    platform: 'Verbal',
    source: 'audio',
    timestamp: Date.now(),
  };
}

function extractTitleFromText(text: string): string {
  // Try to extract a meaningful title from the text
  const words = text.split(' ').slice(0, 8).join(' ');
  return words.length > 50 ? words.substring(0, 50) + '...' : words;
}

function simpleHash(str: string): string {
  const normalized = str.replace(/\s+/g, ' ').trim().substring(0, 500);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash) + normalized.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}
