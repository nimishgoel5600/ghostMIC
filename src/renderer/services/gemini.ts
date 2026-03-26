import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getClient(apiKey: string): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function resetGeminiClient(): void {
  genAI = null;
}

export async function* streamGemini(
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): AsyncGenerator<string> {
  const client = getClient(apiKey);
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContentStream(userMessage);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

export async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const client = getClient(apiKey);
  const model = client.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userMessage);
  return result.response.text();
}
