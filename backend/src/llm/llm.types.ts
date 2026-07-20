export interface LlmTextResult {
  text: string;
  modelName: string;
}

export interface LlmClient {
  generateText(prompt: string, systemInstruction?: string): Promise<LlmTextResult>;
}
