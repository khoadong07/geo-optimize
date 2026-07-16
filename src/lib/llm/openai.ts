import OpenAI from "openai";
import { config } from "../../config";
import { HttpError } from "../httpError";
import type { LlmClient, LlmTextResult } from "./types";

let client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!config.openaiApiKey) {
    throw new HttpError(503, "OPENAI_API_KEY is not configured");
  }
  if (!client) {
    client = new OpenAI({ apiKey: config.openaiApiKey });
  }
  return client;
}

export const openaiClient: LlmClient = {
  async generateText(prompt: string, systemInstruction?: string): Promise<LlmTextResult> {
    const response = await getClient().chat.completions.create({
      model: config.openaiModel,
      messages: [
        ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
        { role: "user" as const, content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    return { text, modelName: response.model };
  },
};
