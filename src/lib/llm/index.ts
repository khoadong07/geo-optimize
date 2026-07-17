import type { LlmProvider, PlatformName } from "@prisma/client";
import { config } from "../../config";
import { HttpError } from "../httpError";
import { deepInfraGeminiFallbackClient, deepInfraOpenaiFallbackClient } from "./deepinfra";
import { geminiClient } from "./gemini";
import { openaiClient } from "./openai";
import type { LlmClient } from "./types";

export type { LlmClient, LlmTextResult } from "./types";

// Phase 1 only wires Gemini + OpenAI (per the platform's rollout plan).
// Perplexity/Grok/Copilot/Google AI Overview have no suitable official API
// yet and are intentionally left unimplemented rather than scraped.
//
// Neither OPENAI_API_KEY nor GEMINI_API_KEY is required to be the real
// thing: when the real key for a slot is missing, calls transparently fall
// back to DeepInfra (gpt-oss-120b for OPENAI, Gemini 2.5 Flash for GEMINI —
// see lib/llm/deepinfra.ts) using the same PlatformName/LlmProvider value.
function resolveOpenAiLike(): LlmClient {
  return config.openaiApiKey ? openaiClient : deepInfraOpenaiFallbackClient;
}

function resolveGeminiLike(): LlmClient {
  return config.geminiApiKey ? geminiClient : deepInfraGeminiFallbackClient;
}

export function llmClientForProvider(provider: LlmProvider): LlmClient {
  switch (provider) {
    case "OPENAI":
      return resolveOpenAiLike();
    case "GEMINI":
      return resolveGeminiLike();
    default:
      throw new HttpError(400, `LLM provider "${provider}" is not supported yet (phase 1: OpenAI + Gemini only)`);
  }
}

export function llmClientForPlatform(platform: PlatformName): LlmClient {
  switch (platform) {
    case "OPENAI":
      return resolveOpenAiLike();
    case "GEMINI":
      return resolveGeminiLike();
    default:
      throw new HttpError(400, `Platform "${platform}" has no wired API client yet (phase 1: OpenAI + Gemini only)`);
  }
}
