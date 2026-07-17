import OpenAI from "openai";
import { config } from "../../config";
import { HttpError } from "../httpError";
import type { LlmClient, LlmTextResult } from "./types";

// DeepInfra exposes an OpenAI-compatible chat completions endpoint that also
// proxies Google's Gemini models, so the same SDK/client shape covers both
// fallback slots — only the `model` string differs.
const DEEPINFRA_BASE_URL = "https://api.deepinfra.com/v1/openai";

let client: OpenAI | undefined;

function getClient(): OpenAI {
  if (!config.deepinfraApiKey) {
    throw new HttpError(503, "DEEPINFRA_API_KEY is not configured");
  }
  if (!client) {
    client = new OpenAI({ apiKey: config.deepinfraApiKey, baseURL: DEEPINFRA_BASE_URL });
  }
  return client;
}

function createDeepInfraClient(model: string): LlmClient {
  return {
    async generateText(prompt: string, systemInstruction?: string): Promise<LlmTextResult> {
      const response = await getClient().chat.completions.create({
        model,
        messages: [
          ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
          { role: "user" as const, content: prompt },
        ],
      });

      const text = response.choices[0]?.message?.content ?? "";
      return { text, modelName: response.model };
    },
  };
}

// Fallback for the OPENAI provider/platform (gpt-oss-120b).
export const deepInfraOpenaiFallbackClient: LlmClient = createDeepInfraClient(config.deepinfraOpenaiModel);

// Fallback for the GEMINI provider/platform (Gemini 2.5 Flash, proxied by DeepInfra).
export const deepInfraGeminiFallbackClient: LlmClient = createDeepInfraClient(config.deepinfraGeminiModel);
