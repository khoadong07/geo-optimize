export interface PlanConfig {
  slug: string;
  name: string;
  priceVnd: number;
  maxProjects: number;
  allowedPlatforms: Array<'GEMINI' | 'OPENAI'>;
  maxRunsPerPrompt: number;
}

// Mirrors the purchasable plans in frontend/app/i18n.tsx's `pricing.plans` —
// kept in sync manually since plans aren't a backend-managed collection
// (unlike Reports). Enterprise is intentionally excluded: it's "contact
// sales" only, no direct checkout, so its limits are negotiated manually by
// whoever provisions the account.
//
// These starting numbers are a reasonable first pass, not a fixed business
// decision — adjust freely:
export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  'starter-vn': {
    slug: 'starter-vn',
    name: 'Starter VN',
    priceVnd: 2_500_000,
    maxProjects: 1,
    allowedPlatforms: ['GEMINI', 'OPENAI'],
    maxRunsPerPrompt: 3,
  },
  'growth-vn': {
    slug: 'growth-vn',
    name: 'Growth VN',
    priceVnd: 7_500_000,
    maxProjects: 3,
    allowedPlatforms: ['GEMINI', 'OPENAI'],
    maxRunsPerPrompt: 5,
  },
};
