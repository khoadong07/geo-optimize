import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../../config";
import { HttpError } from "../httpError";
import type { LlmClient, LlmTextResult } from "./types";

let client: GoogleGenerativeAI | undefined;

function getClient(): GoogleGenerativeAI {
  if (!config.geminiApiKey) {
    throw new HttpError(503, "GEMINI_API_KEY is not configured");
  }
  if (!client) {
    client = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return client;
}

export const geminiClient: LlmClient = {
  async generateText(prompt: string, systemInstruction?: string): Promise<LlmTextResult> {
    const model = getClient().getGenerativeModel({
      model: config.geminiModel,
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    const result = await model.generateContent(prompt);
    return { text: result.response.text(), modelName: config.geminiModel };
  },
};
