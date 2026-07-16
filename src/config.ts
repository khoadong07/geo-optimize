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
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
};
