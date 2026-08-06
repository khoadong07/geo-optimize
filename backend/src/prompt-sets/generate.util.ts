import { deepInfraOpenaiFallbackClient } from '../llm/deepinfra.client';
import { PromptIntent } from './prompt-set.schema';

const INTENT_GUIDANCE: Record<PromptIntent, string> = {
  Discovery:
    'General discovery/search questions — the user does NOT yet know about a specific brand, they are just looking for a solution to a need (e.g. "what\'s the best app for...", "which one should I choose for...").',
  Comparison:
    'Questions comparing multiple options in the industry — may name specific competitors from the list (e.g. "X vs Y: which is better for...", "compare X and Y on..."), but must NEVER name the tracked brand itself. The point is to see whether the AI brings the tracked brand up on its own even though it was never mentioned.',
  Branded:
    'Reputation/trust-style questions about the industry — which provider is most trustworthy, reliable, licensed, or well-regarded — phrased neutrally without naming the tracked brand or any competitor, so any brand that comes up in the answer does so organically.',
  'Long-tail':
    'Long, specific, detailed questions about a niche situation or need related to the industry — must not name the tracked brand or any competitor.',
};

const LANGUAGE_NAME: Record<'en' | 'vi', string> = {
  en: 'English',
  vi: 'Vietnamese',
};

function buildGenerationPrompt(params: {
  brandName: string;
  industry: string;
  competitors: string[];
  intent: PromptIntent;
  count: number;
  trendingTopics?: string[];
  lang: 'en' | 'vi';
}): string {
  const trendingBlock = params.trendingTopics?.length
    ? `\nCurrently trending topics in this industry (lean into these where they fit the intent, to make the questions timelier and more effective):\n${params.trendingTopics.map((t) => `- ${t}`).join('\n')}\n`
    : '';
  const languageName = LANGUAGE_NAME[params.lang];

  return `You are a market research expert. Task: generate questions that a real user might type into an AI assistant (like ChatGPT, Gemini) when searching for information related to the "${params.industry}" industry.

Brand information (for your context only — see the strict rule below on how it may appear in the questions):
- Brand name: ${params.brandName}
- Competitors: ${params.competitors.length ? params.competitors.join(', ') : 'not specified'}
${trendingBlock}
Intent type to generate: ${params.intent}
${INTENT_GUIDANCE[params.intent]}

CRITICAL — unbiased phrasing (this is the whole point of the exercise, do not skip it):
- NEVER mention "${params.brandName}" by name inside any question. We are measuring whether the AI brings the brand up on its own, unprompted — naming it in the question would defeat that.
- NEVER phrase a question as a leading/loaded yes-or-no confirmation that presupposes a brand is the best or better (e.g. do NOT write something like "Is ${params.brandName} the bank with the best interest rates?"). Instead ask the open, neutral version a real person with no prior opinion would type (e.g. "Which bank currently has the best interest rates?").
- Every question must read as genuinely neutral market research, not a pitch or a confirmation check for any single brand.

Generate exactly ${params.count} questions in ${languageName}, written naturally as a real native ${languageName}-speaking user would type them into an AI assistant — with varied phrasing and no duplicate meanings.

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
  lang: 'en' | 'vi';
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
