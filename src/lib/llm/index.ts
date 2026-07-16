import type { LlmProvider, PlatformName } from "@prisma/client";
import { HttpError } from "../httpError";
import { geminiClient } from "./gemini";
import { openaiClient } from "./openai";
import type { LlmClient } from "./types";

export type { LlmClient, LlmTextResult } from "./types";

// Phase 1 only wires Gemini + OpenAI (per the platform's rollout plan).
// Perplexity/Grok/Copilot/Google AI Overview have no suitable official API
// yet and are intentionally left unimplemented rather than scraped.
export function llmClientForProvider(provider: LlmProvider): LlmClient {
  switch (provider) {
    case "OPENAI":
      return openaiClient;
    case "GEMINI":
      return geminiClient;
    default:
      throw new HttpError(400, `LLM provider "${provider}" is not supported yet (phase 1: OpenAI + Gemini only)`);
  }
}

export function llmClientForPlatform(platform: PlatformName): LlmClient {
  switch (platform) {
    case "OPENAI":
      return openaiClient;
    case "GEMINI":
      return geminiClient;
    default:
      throw new HttpError(400, `Platform "${platform}" has no wired API client yet (phase 1: OpenAI + Gemini only)`);
  }
}
