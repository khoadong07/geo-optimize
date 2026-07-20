import { ServiceUnavailableException } from '@nestjs/common';
import OpenAI from 'openai';
import { LlmClient, LlmTextResult } from './llm.types';

let client: OpenAI | undefined;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ServiceUnavailableException('OPENAI_API_KEY is not configured');
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export const openaiClient: LlmClient = {
  async generateText(prompt: string, systemInstruction?: string): Promise<LlmTextResult> {
    const response = await getClient().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        ...(systemInstruction ? [{ role: 'system' as const, content: systemInstruction }] : []),
        { role: 'user' as const, content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content ?? '';
    return { text, modelName: response.model };
  },
};
