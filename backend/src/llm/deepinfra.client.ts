import { ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { LlmClient, LlmTextResult } from './llm.types';

// DeepInfra exposes an OpenAI-compatible chat completions endpoint that also
// proxies Google's Gemini models, so the same SDK/client shape covers both
// fallback slots — only the `model` string differs.
const DEEPINFRA_BASE_URL = 'https://api.deepinfra.com/v1/openai';

let client: OpenAI | undefined;

function getClient(): OpenAI {
  const apiKey = process.env.DEEPINFRA_API_KEY;
  if (!apiKey) {
    throw new ServiceUnavailableException('DEEPINFRA_API_KEY is not configured');
  }
  if (!client) {
    client = new OpenAI({ apiKey, baseURL: DEEPINFRA_BASE_URL });
  }
  return client;
}

function createDeepInfraClient(model: string): LlmClient {
  return {
    async generateText(prompt: string, systemInstruction?: string): Promise<LlmTextResult> {
      const response = await getClient().chat.completions.create({
        model,
        messages: [
          ...(systemInstruction ? [{ role: 'system' as const, content: systemInstruction }] : []),
          { role: 'user' as const, content: prompt },
        ],
      });

      const text = response.choices[0]?.message?.content ?? '';
      return { text, modelName: response.model };
    },
  };
}

// Fallback for the OPENAI platform slot.
export const deepInfraOpenaiFallbackClient: LlmClient = createDeepInfraClient(
  process.env.DEEPINFRA_OPENAI_MODEL || 'openai/gpt-oss-120b',
);

// Fallback for the GEMINI platform slot (proxied by DeepInfra).
export const deepInfraGeminiFallbackClient: LlmClient = createDeepInfraClient(
  process.env.DEEPINFRA_GEMINI_MODEL || 'google/gemini-2.5-flash',
);
