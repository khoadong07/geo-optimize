import { deepInfraOpenaiFallbackClient } from '../llm/deepinfra.client';
import { PromptIntent } from './prompt-set.schema';

const INTENT_GUIDANCE: Record<PromptIntent, string> = {
  Discovery:
    'Câu hỏi khám phá/tìm kiếm chung — người dùng CHƯA biết tới thương hiệu cụ thể, chỉ đang tìm giải pháp cho nhu cầu (ví dụ: "ứng dụng nào tốt nhất để...", "nên chọn... nào").',
  Comparison:
    'Câu hỏi so sánh trực tiếp thương hiệu với một hoặc nhiều đối thủ cạnh tranh đã liệt kê ở trên (ví dụ: "A vs B: nên chọn cái nào", "so sánh A và B về...").',
  Branded:
    'Câu hỏi hỏi trực tiếp về chính thương hiệu này — độ uy tín, tính năng, có nên dùng không, có được cấp phép không.',
  'Long-tail':
    'Câu hỏi dài, cụ thể, chi tiết về một tình huống hoặc nhu cầu ngách liên quan tới ngành (không nhất thiết nhắc brand hay đối thủ).',
};

function buildGenerationPrompt(params: {
  brandName: string;
  industry: string;
  competitors: string[];
  intent: PromptIntent;
  count: number;
  trendingTopics?: string[];
}): string {
  const trendingBlock = params.trendingTopics?.length
    ? `\nCác chủ đề đang trending trong ngành (ưu tiên bám sát các chủ đề này khi phù hợp với ý định, để câu hỏi có tính thời sự và hiệu quả hơn):\n${params.trendingTopics.map((t) => `- ${t}`).join('\n')}\n`
    : '';

  return `Bạn là chuyên gia nghiên cứu thị trường. Nhiệm vụ: sinh ra các câu hỏi mà người dùng thật có thể gõ vào một trợ lý AI (như ChatGPT, Gemini) khi tìm kiếm thông tin liên quan tới ngành "${params.industry}".

Thông tin thương hiệu:
- Tên thương hiệu: ${params.brandName}
- Đối thủ cạnh tranh: ${params.competitors.length ? params.competitors.join(', ') : 'chưa xác định'}
${trendingBlock}
Loại ý định cần sinh: ${params.intent}
${INTENT_GUIDANCE[params.intent]}

Sinh ra chính xác ${params.count} câu hỏi bằng tiếng Việt, tự nhiên như người dùng thật sẽ gõ, đa dạng cách diễn đạt, không trùng lặp ý.

Chỉ trả về JSON thuần dạng mảng chuỗi, không kèm giải thích hay markdown code fence, theo đúng cấu trúc:
["câu hỏi 1", "câu hỏi 2", "câu hỏi 3"]`;
}

export async function generatePromptCandidates(params: {
  brandName: string;
  industry: string;
  competitors: string[];
  intent: PromptIntent;
  count: number;
  trendingTopics?: string[];
}): Promise<string[]> {
  const prompt = buildGenerationPrompt(params);
  const { text } = await deepInfraOpenaiFallbackClient.generateText(prompt, 'Bạn chỉ trả lời bằng JSON thuần, không kèm giải thích.');

  const jsonSlice = text.slice(text.indexOf('['), text.lastIndexOf(']') + 1);
  const parsed = JSON.parse(jsonSlice.length > 0 ? jsonSlice : text);

  if (!Array.isArray(parsed)) {
    throw new Error('LLM did not return a JSON array');
  }

  return parsed.filter((q): q is string => typeof q === 'string' && q.trim().length > 0).slice(0, params.count);
}
