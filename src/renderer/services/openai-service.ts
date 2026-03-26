import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(apiKey: string): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }
  return client;
}

export function resetOpenAIClient(): void {
  client = null;
}

export async function* streamOpenAI(
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): AsyncGenerator<string> {
  const openai = getClient(apiKey);
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      yield text;
    }
  }
}

export async function callOpenAI(
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const openai = getClient(apiKey);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  });

  return response.choices[0]?.message?.content || '';
}
