import { Injectable } from '@nestjs/common';
import { deepInfraGeminiFallbackClient, deepInfraOpenaiFallbackClient } from './deepinfra.client';
import { geminiClient } from './gemini.client';
import { LlmClient } from './llm.types';
import { openaiClient } from './openai.client';

export type Platform = 'GEMINI' | 'OPENAI';

// Neither OPENAI_API_KEY nor GEMINI_API_KEY needs to be set: when the real
// key for a slot is missing, calls transparently fall back to DeepInfra
// (gpt-oss-120b for OPENAI, Gemini 2.5 Flash for GEMINI) using the same
// Platform value — see deepinfra.client.ts.
@Injectable()
export class LlmService {
  clientFor(platform: Platform): LlmClient {
    if (platform === 'OPENAI') {
      return process.env.OPENAI_API_KEY ? openaiClient : deepInfraOpenaiFallbackClient;
    }
    return process.env.GEMINI_API_KEY ? geminiClient : deepInfraGeminiFallbackClient;
  }
}
