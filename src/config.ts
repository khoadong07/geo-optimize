import "dotenv/config";

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  openaiApiKey: optional("OPENAI_API_KEY"),
  geminiApiKey: optional("GEMINI_API_KEY"),
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  // DeepInfra: used as an automatic fallback when the real OPENAI_API_KEY /
  // GEMINI_API_KEY aren't configured — same PlatformName/LlmProvider values
  // ("OPENAI"/"GEMINI"), just backed by a different inference host. Both
  // models are served through DeepInfra's single OpenAI-compatible endpoint.
  deepinfraApiKey: optional("DEEPINFRA_API_KEY"),
  deepinfraOpenaiModel: process.env.DEEPINFRA_OPENAI_MODEL ?? "openai/gpt-oss-120b",
  deepinfraGeminiModel: process.env.DEEPINFRA_GEMINI_MODEL ?? "google/gemini-2.5-flash",
};
