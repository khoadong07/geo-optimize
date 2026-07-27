import { LlmService } from '../llm/llm.service';
import { WebsiteText } from './website-fetch.util';

// Mirrors frontend/app/industry.ts's PROJECT_INDUSTRIES — kept in sync
// manually since the two apps don't share a package.
export const TRIAL_INDUSTRIES = ['Banking', 'FMCG', 'Insurance', 'Telecom', 'Real Estate', 'Other'];

export interface IndustryDetectionResult {
  brandName: string;
  industry: string;
  suggestedCompetitors: string[];
}

function buildPrompt(params: { domain: string; zone: string; websiteText: WebsiteText | null }): string {
  const siteBlock = params.websiteText
    ? `Homepage title: ${params.websiteText.title || '(none)'}
Meta description: ${params.websiteText.description || '(none)'}
Page text sample: ${params.websiteText.textSample.slice(0, 1500) || '(none)'}`
    : '(The page could not be fetched — infer everything from the domain name alone.)';

  return `You are a market research analyst. A visitor gave you their company website and region for a trial of a brand-visibility tracking tool. Based on the information below, identify the brand and its industry, and suggest real competitor brands.

Website domain: ${params.domain}
Region: ${params.zone}
${siteBlock}

Task:
1. Guess the brand/company name (short, as it would appear in marketing copy).
2. Classify the industry into exactly one of: ${TRIAL_INDUSTRIES.join(', ')}. Use "Other" only if truly none fit.
3. Suggest 4 to 6 real, well-known competitor brand names that operate in the same industry and region.

Return ONLY plain JSON, no explanation or markdown fence, in exactly this shape:
{"brandName": "...", "industry": "...", "suggestedCompetitors": ["...", "..."]}`;
}

function fallback(domain: string): IndustryDetectionResult {
  return { brandName: domain, industry: 'Other', suggestedCompetitors: [] };
}

export async function detectIndustryAndCompetitors(
  llmService: LlmService,
  params: { domain: string; zone: string; websiteText: WebsiteText | null },
): Promise<IndustryDetectionResult> {
  try {
    const prompt = buildPrompt(params);
    const { text } = await llmService
      .clientFor('OPENAI')
      .generateText(prompt, 'You only respond with plain JSON, no explanation.');

    const jsonSlice = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const parsed = JSON.parse(jsonSlice.length > 0 ? jsonSlice : text);

    const brandName = typeof parsed.brandName === 'string' && parsed.brandName.trim() ? parsed.brandName.trim() : params.domain;
    const industry = TRIAL_INDUSTRIES.includes(parsed.industry) ? parsed.industry : 'Other';
    const suggestedCompetitors = Array.isArray(parsed.suggestedCompetitors)
      ? parsed.suggestedCompetitors.filter((c: unknown): c is string => typeof c === 'string' && c.trim().length > 0).slice(0, 6)
      : [];

    return { brandName, industry, suggestedCompetitors };
  } catch {
    return fallback(params.domain);
  }
}
