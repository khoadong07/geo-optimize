import { ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { LlmClient, LlmTextResult } from './llm.types';

let client: GoogleGenerativeAI | undefined;

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ServiceUnavailableException('GEMINI_API_KEY is not configured');
  }
  if (!client) {
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

export const geminiClient: LlmClient = {
  async generateText(prompt: string, systemInstruction?: string): Promise<LlmTextResult> {
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = getClient().getGenerativeModel({
      model: modelName,
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    const result = await model.generateContent(prompt);
    return { text: result.response.text(), modelName };
  },
};
