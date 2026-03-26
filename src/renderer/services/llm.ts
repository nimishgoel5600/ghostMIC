import type { LLMProvider, AppSettings } from '../../shared/types';
import { streamGemini, callGemini, resetGeminiClient } from './gemini';
import { streamOpenAI, callOpenAI, resetOpenAIClient } from './openai-service';
import { streamAnthropic, callAnthropic, resetAnthropicClient } from './anthropic';

export function getApiKey(settings: AppSettings, provider?: LLMProvider): string {
  const p = provider || settings.defaultLLM;
  switch (p) {
    case 'gemini':
      return settings.apiKeys.gemini;
    case 'openai':
      return settings.apiKeys.openai;
    case 'anthropic':
      return settings.apiKeys.anthropic;
  }
}

export function isProviderConfigured(settings: AppSettings, provider?: LLMProvider): boolean {
  return getApiKey(settings, provider).length > 5;
}

export async function* streamLLM(
  settings: AppSettings,
  systemPrompt: string,
  userMessage: string,
  provider?: LLMProvider
): AsyncGenerator<string> {
  const p = provider || settings.defaultLLM;
  const apiKey = getApiKey(settings, p);

  if (!apiKey) {
    throw new Error(`No API key configured for ${p}`);
  }

  switch (p) {
    case 'gemini':
      yield* streamGemini(apiKey, systemPrompt, userMessage);
      break;
    case 'openai':
      yield* streamOpenAI(apiKey, systemPrompt, userMessage);
      break;
    case 'anthropic':
      yield* streamAnthropic(apiKey, systemPrompt, userMessage);
      break;
  }
}

export async function callLLM(
  settings: AppSettings,
  systemPrompt: string,
  userMessage: string,
  provider?: LLMProvider
): Promise<string> {
  const p = provider || settings.defaultLLM;
  const apiKey = getApiKey(settings, p);

  if (!apiKey) {
    throw new Error(`No API key configured for ${p}`);
  }

  switch (p) {
    case 'gemini':
      return callGemini(apiKey, systemPrompt, userMessage);
    case 'openai':
      return callOpenAI(apiKey, systemPrompt, userMessage);
    case 'anthropic':
      return callAnthropic(apiKey, systemPrompt, userMessage);
  }
}

export function resetAllClients(): void {
  resetGeminiClient();
  resetOpenAIClient();
  resetAnthropicClient();
}
