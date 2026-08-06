import { LlmService } from '../llm/llm.service';
import { WebsiteText } from './website-fetch.util';

export interface IndustryDetectionResult {
  brandName: string;
  industry: string;
  suggestedCompetitors: string[];
}

// How each zone should shape competitor suggestions — a local-market zone
// should surface brands actually known in that specific country, while
// "international" should surface global players rather than defaulting to
// whichever country the model happens to think of first.
const ZONE_CONTEXT: Record<string, string> = {
  vietnam:
    'Vietnam — this is a domestic Vietnamese market brand. Suggest competitors that are well-known specifically in Vietnam (local Vietnamese brands, or foreign brands with a strong presence in Vietnam) — do not suggest brands that only operate in other countries.',
  thailand:
    'Thailand — this is a domestic Thai market brand. Suggest competitors that are well-known specifically in Thailand (local Thai brands, or foreign brands with a strong presence in Thailand) — do not suggest brands that only operate in other countries.',
  indonesia:
    'Indonesia — this is a domestic Indonesian market brand. Suggest competitors that are well-known specifically in Indonesia (local Indonesian brands, or foreign brands with a strong presence in Indonesia) — do not suggest brands that only operate in other countries.',
  international:
    'International/global — this brand competes globally, not in one specific country. Suggest well-known international/global competitor brands rather than brands tied to a single local market.',
};

function buildPrompt(params: { domain: string; zone: string; websiteText: WebsiteText | null; industries: string[] }): string {
  const siteBlock = params.websiteText
    ? `Homepage title: ${params.websiteText.title || '(none)'}
Meta description: ${params.websiteText.description || '(none)'}
Page text sample: ${params.websiteText.textSample.slice(0, 1500) || '(none)'}`
    : '(The page could not be fetched — infer everything from the domain name alone.)';
  const zoneContext = ZONE_CONTEXT[params.zone] || params.zone;

  return `You are a market research analyst. A visitor gave you their company website and region for a trial of a brand-visibility tracking tool. Based on the information below, identify the brand and its industry, and suggest real competitor brands.

Website domain: ${params.domain}
Region: ${zoneContext}
${siteBlock}

Task:
1. Guess the brand/company name (short, as it would appear in marketing copy).
2. Classify the industry into exactly one of: ${params.industries.join(', ')}. Use "Other" only if truly none fit.
3. Suggest 4 to 6 real, well-known competitor brand names — follow the region guidance above precisely, since a competitor irrelevant to that market is worse than no suggestion at all.

Return ONLY plain JSON, no explanation or markdown fence, in exactly this shape:
{"brandName": "...", "industry": "...", "suggestedCompetitors": ["...", "..."]}`;
}

function fallback(domain: string): IndustryDetectionResult {
  return { brandName: domain, industry: 'Other', suggestedCompetitors: [] };
}

export async function detectIndustryAndCompetitors(
  llmService: LlmService,
  params: { domain: string; zone: string; websiteText: WebsiteText | null; industries: string[] },
): Promise<IndustryDetectionResult> {
  try {
    const prompt = buildPrompt(params);
    const { text } = await llmService
      .clientFor('OPENAI')
      .generateText(prompt, 'You only respond with plain JSON, no explanation.');

    const jsonSlice = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const parsed = JSON.parse(jsonSlice.length > 0 ? jsonSlice : text);

    const brandName = typeof parsed.brandName === 'string' && parsed.brandName.trim() ? parsed.brandName.trim() : params.domain;
    const industry = params.industries.includes(parsed.industry) ? parsed.industry : 'Other';
    const suggestedCompetitors = Array.isArray(parsed.suggestedCompetitors)
      ? parsed.suggestedCompetitors.filter((c: unknown): c is string => typeof c === 'string' && c.trim().length > 0).slice(0, 6)
      : [];

    return { brandName, industry, suggestedCompetitors };
  } catch {
    return fallback(params.domain);
  }
}
