import { useEffect } from 'react';
import { useAppStore } from '../store/app-store';
import { streamLLM, isProviderConfigured } from '../services/llm';
import {
  buildInterviewSystemPrompt,
  buildInterviewUserPrompt,
  buildCodingSolverPrompt,
} from '../services/prompt-builder';
import { parseSolutionResponse } from '../services/problem-parser';
import { createProblemFromAudio } from '../services/coding-detector';
import type { QAPair, CodingProblem, LLMProvider } from '../../shared/types';

const LLM_FALLBACK_ORDER: LLMProvider[] = ['gemini', 'openai', 'anthropic'];

/**
 * Pick a working LLM: try the default first, then fall back to any other configured one.
 */
function pickProvider(settings: ReturnType<typeof useAppStore.getState>['settings']): LLMProvider | null {
  if (isProviderConfigured(settings, settings.defaultLLM)) {
    return settings.defaultLLM;
  }
  for (const p of LLM_FALLBACK_ORDER) {
    if (isProviderConfigured(settings, p)) return p;
  }
  return null;
}

async function generateAnswer(question: string): Promise<void> {
  const store = useAppStore.getState();
  const { settings, qaPairs } = store;

  const provider = pickProvider(settings);
  if (!provider) {
    console.error('[GhostMic] No LLM API key configured at all');
    store.setGenerating(true);
    store.setCurrentAnswer('Error: No LLM API key configured. Open Settings → AI and add a key.');
    return;
  }

  console.log('[GhostMic] Generating answer with', provider, 'for:', question.substring(0, 60));
  store.setGenerating(true);
  store.setCurrentAnswer('');
  const startTime = Date.now();

  // Try the chosen provider; if it fails, try the next one
  const providers = [provider, ...LLM_FALLBACK_ORDER.filter(p => p !== provider && isProviderConfigured(settings, p))];

  for (const p of providers) {
    try {
      const systemPrompt = buildInterviewSystemPrompt(settings);
      const userPrompt = buildInterviewUserPrompt(question, qaPairs);

      let fullAnswer = '';
      for await (const chunk of streamLLM(settings, systemPrompt, userPrompt, p)) {
        fullAnswer += chunk;
        useAppStore.getState().setCurrentAnswer(fullAnswer);
      }

      if (!fullAnswer) continue; // Empty response, try next

      const responseTime = Date.now() - startTime;
      const refs: string[] = [];
      if (settings.resumeParsed) {
        const lower = fullAnswer.toLowerCase();
        if (lower.includes('experience')) refs.push('experience');
        if (lower.includes('project')) refs.push('projects');
        if (lower.includes('skill')) refs.push('skills');
        if (lower.includes('education')) refs.push('education');
      }

      const pair: QAPair = {
        id: `qa-${Date.now()}`,
        question,
        answer: fullAnswer,
        model: p,
        timestamp: Date.now(),
        responseTime,
        referencedSections: refs,
      };

      useAppStore.getState().addQAPair(pair);
      useAppStore.getState().setCurrentAnswer('');
      useAppStore.getState().setGenerating(false);
      console.log('[GhostMic] Answer generated via', p, 'in', responseTime, 'ms');
      return; // Success — exit

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[GhostMic] ${p} failed:`, msg);

      // If there's another provider to try, show a status message
      const nextIdx = providers.indexOf(p) + 1;
      if (nextIdx < providers.length) {
        useAppStore.getState().setCurrentAnswer(`${p} failed (${msg.substring(0, 60)}). Trying ${providers[nextIdx]}...`);
        continue;
      }

      // All providers failed
      useAppStore.getState().setCurrentAnswer(`Error: ${msg}`);
    }
  }

  useAppStore.getState().setGenerating(false);
}

async function solveProblem(problem: CodingProblem): Promise<void> {
  const store = useAppStore.getState();
  const { settings } = store;

  const provider = pickProvider(settings);
  if (!provider) {
    console.error('[GhostMic] No LLM API key configured');
    return;
  }

  console.log('[GhostMic] Solving problem with', provider, ':', problem.title);
  store.setSolving(true);
  store.setCurrentCode('');
  const startTime = Date.now();

  try {
    const { system, user } = buildCodingSolverPrompt(problem, settings);

    let fullResponse = '';
    for await (const chunk of streamLLM(settings, system, user, provider)) {
      fullResponse += chunk;
      useAppStore.getState().setCurrentCode(fullResponse);
    }

    const solveTime = Date.now() - startTime;
    const solution = parseSolutionResponse(
      fullResponse,
      problem.id,
      settings.preferredLanguage,
      provider,
      solveTime
    );

    useAppStore.getState().setCurrentSolution(solution);
    console.log('[GhostMic] Problem solved via', provider, 'in', solveTime, 'ms');
  } catch (err) {
    console.error('[GhostMic] Code solver error:', err);
    useAppStore.getState().setCurrentCode(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  useAppStore.getState().setSolving(false);
}

export function useLLM() {
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const { mode } = useAppStore.getState();

      console.log('[GhostMic] Question event received:', detail.text?.substring(0, 40), 'coding:', detail.isCoding, 'mode:', mode);

      if (detail.isCoding) {
        const problem = createProblemFromAudio(detail.text);
        useAppStore.getState().setCurrentProblem(problem);
        useAppStore.getState().setMode('coding');
        solveProblem(problem);
      } else {
        generateAnswer(detail.text);
      }
    };

    window.addEventListener('ghostmic:question-detected', handler);
    return () => window.removeEventListener('ghostmic:question-detected', handler);
  }, []);

  return { generateAnswer, solveProblem };
}
