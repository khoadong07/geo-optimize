import type { SentimentLabel } from "@prisma/client";
import type { LlmClient } from "../lib/llm";

export interface SentimentResult {
  label: SentimentLabel;
  reasoning: string;
  topics: string[];
  judgeModel: string;
}

const VALID_LABELS: SentimentLabel[] = ["POSITIVE", "NEUTRAL", "NEGATIVE", "NOT_APPLICABLE"];

function buildJudgePrompt(rawResponse: string, brandName: string): string {
  return `Bạn là một LLM-as-judge. Dưới đây là một câu trả lời do một mô hình AI khác sinh ra khi được hỏi một câu hỏi liên quan đến thương hiệu "${brandName}".

Hãy đánh giá sentiment (thái độ) của câu trả lời ĐỐI VỚI RIÊNG thương hiệu "${brandName}" — không phải sentiment chung của cả đoạn văn.

Câu trả lời cần đánh giá:
"""
${rawResponse}
"""

Chỉ trả về JSON thuần, không kèm giải thích hay markdown code fence, theo đúng cấu trúc:
{ "label": "POSITIVE" | "NEUTRAL" | "NEGATIVE", "reasoning": "lý do ngắn gọn bằng tiếng Việt", "topics": ["chủ đề 1", "chủ đề 2"] }`;
}

// LLM-as-judge sentiment classification, scoped to the brand specifically
// (not overall text sentiment). Judge-response parsing failures degrade to
// a NEUTRAL fallback rather than failing the whole run — a bad judge call
// shouldn't discard a perfectly good tracked response.
export async function classifySentiment(
  llm: LlmClient,
  params: { rawResponse: string; brandName: string; brandMentioned: boolean },
): Promise<SentimentResult> {
  if (!params.brandMentioned) {
    return { label: "NOT_APPLICABLE", reasoning: "Brand was not mentioned in the response.", topics: [], judgeModel: "n/a" };
  }

  const prompt = buildJudgePrompt(params.rawResponse, params.brandName);
  const { text, modelName } = await llm.generateText(prompt, "Bạn chỉ trả lời bằng JSON thuần.");

  try {
    const jsonSlice = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonSlice.length > 0 ? jsonSlice : text) as {
      label?: string;
      reasoning?: string;
      topics?: unknown;
    };

    if (!parsed.label || !VALID_LABELS.includes(parsed.label as SentimentLabel)) {
      throw new Error(`unrecognized label "${parsed.label}"`);
    }

    return {
      label: parsed.label as SentimentLabel,
      reasoning: parsed.reasoning ?? "",
      topics: Array.isArray(parsed.topics) ? parsed.topics.filter((t): t is string => typeof t === "string") : [],
      judgeModel: modelName,
    };
  } catch (err) {
    console.warn("Sentiment judge response could not be parsed, falling back to NEUTRAL:", err);
    return {
      label: "NEUTRAL",
      reasoning: `(fallback — judge response could not be parsed) ${text.slice(0, 500)}`,
      topics: [],
      judgeModel: modelName,
    };
  }
}
