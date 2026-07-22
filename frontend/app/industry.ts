const INDUSTRY_LABELS: Record<string, { en: string; vi: string }> = {
  'ngân hàng': { en: 'Banking', vi: 'Ngân hàng' },
  banking: { en: 'Banking', vi: 'Ngân hàng' },
};

export function industryLabel(industry?: string | null, lang: 'en' | 'vi' = 'en'): string | null {
  if (!industry) return null;
  return INDUSTRY_LABELS[industry.trim().toLowerCase()]?.[lang] || industry;
}
