const INDUSTRY_LABELS: Record<string, { en: string; vi: string }> = {
  'ngân hàng': { en: 'Banking', vi: 'Ngân hàng' },
  banking: { en: 'Banking', vi: 'Ngân hàng' },
  fmcg: { en: 'FMCG', vi: 'FMCG' },
  insurance: { en: 'Insurance', vi: 'Bảo hiểm' },
  'bảo hiểm': { en: 'Insurance', vi: 'Bảo hiểm' },
  telecom: { en: 'Telecom', vi: 'Viễn thông' },
  'viễn thông': { en: 'Telecom', vi: 'Viễn thông' },
  'real estate': { en: 'Real Estate', vi: 'Bất động sản' },
  'bất động sản': { en: 'Real Estate', vi: 'Bất động sản' },
};

export const PROJECT_INDUSTRIES = ['Banking', 'FMCG', 'Insurance', 'Telecom', 'Real Estate'];

export function industryLabel(industry?: string | null, lang: 'en' | 'vi' = 'en'): string | null {
  if (!industry) return null;
  return INDUSTRY_LABELS[industry.trim().toLowerCase()]?.[lang] || industry;
}
