const INDUSTRY_LABELS: Record<string, string> = {
  'ngân hàng': 'Banking',
  banking: 'Banking',
};

export function industryLabel(industry?: string | null): string | null {
  if (!industry) return null;
  return INDUSTRY_LABELS[industry.trim().toLowerCase()] || industry;
}
