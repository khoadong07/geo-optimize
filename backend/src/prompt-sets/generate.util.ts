import { deepInfraOpenaiFallbackClient } from '../llm/deepinfra.client';
import { PromptIntent } from './prompt-set.schema';

const INTENT_GUIDANCE: Record<PromptIntent, string> = {
  Discovery:
    'General discovery/search questions — the user does NOT yet know about a specific brand, they are just looking for a solution to a need (e.g. "what\'s the best app for...", "which one should I choose for...").',
  Comparison:
    'Questions that directly compare the brand against one or more of the listed competitors (e.g. "A vs B: which should I choose", "compare A and B on...").',
  Branded:
    "Questions asking directly about this specific brand — its reputation, features, whether it's worth using, whether it's licensed/trustworthy.",
  'Long-tail':
    'Long, specific, detailed questions about a niche situation or need related to the industry (not necessarily mentioning the brand or competitors).',
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
    ? `\nCurrently trending topics in this industry (lean into these where they fit the intent, to make the questions timelier and more effective):\n${params.trendingTopics.map((t) => `- ${t}`).join('\n')}\n`
    : '';

  return `You are a market research expert. Task: generate questions that a real user might type into an AI assistant (like ChatGPT, Gemini) when searching for information related to the "${params.industry}" industry.

Brand information:
- Brand name: ${params.brandName}
- Competitors: ${params.competitors.length ? params.competitors.join(', ') : 'not specified'}
${trendingBlock}
Intent type to generate: ${params.intent}
${INTENT_GUIDANCE[params.intent]}

Generate exactly ${params.count} questions in English, written naturally as a real user would type them, with varied phrasing and no duplicate meanings.

Return ONLY a plain JSON array of strings, with no explanation or markdown code fence, in exactly this shape:
["question 1", "question 2", "question 3"]`;
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
  const { text } = await deepInfraOpenaiFallbackClient.generateText(prompt, 'You only respond with plain JSON, no explanation.');

  const jsonSlice = text.slice(text.indexOf('['), text.lastIndexOf(']') + 1);
  const parsed = JSON.parse(jsonSlice.length > 0 ? jsonSlice : text);

  if (!Array.isArray(parsed)) {
    throw new Error('LLM did not return a JSON array');
  }

  return parsed.filter((q): q is string => typeof q === 'string' && q.trim().length > 0).slice(0, params.count);
}
