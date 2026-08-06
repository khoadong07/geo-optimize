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
  'e-commerce': { en: 'E-commerce', vi: 'Thương mại điện tử' },
  'thương mại điện tử': { en: 'E-commerce', vi: 'Thương mại điện tử' },
  education: { en: 'Education', vi: 'Giáo dục' },
  'giáo dục': { en: 'Education', vi: 'Giáo dục' },
  healthcare: { en: 'Healthcare', vi: 'Y tế' },
  'y tế': { en: 'Healthcare', vi: 'Y tế' },
  automotive: { en: 'Automotive', vi: 'Ô tô - Xe máy' },
  'ô tô - xe máy': { en: 'Automotive', vi: 'Ô tô - Xe máy' },
  'travel & hospitality': { en: 'Travel & Hospitality', vi: 'Du lịch & Khách sạn' },
  'du lịch & khách sạn': { en: 'Travel & Hospitality', vi: 'Du lịch & Khách sạn' },
  'f&b': { en: 'F&B', vi: 'Ẩm thực & Nhà hàng' },
  'ẩm thực & nhà hàng': { en: 'F&B', vi: 'Ẩm thực & Nhà hàng' },
  technology: { en: 'Technology', vi: 'Công nghệ' },
  'công nghệ': { en: 'Technology', vi: 'Công nghệ' },
  logistics: { en: 'Logistics', vi: 'Vận chuyển & Logistics' },
  'vận chuyển & logistics': { en: 'Logistics', vi: 'Vận chuyển & Logistics' },
  'beauty & cosmetics': { en: 'Beauty & Cosmetics', vi: 'Làm đẹp & Mỹ phẩm' },
  'làm đẹp & mỹ phẩm': { en: 'Beauty & Cosmetics', vi: 'Làm đẹp & Mỹ phẩm' },
  'fashion & retail': { en: 'Fashion & Retail', vi: 'Thời trang & Bán lẻ' },
  'thời trang & bán lẻ': { en: 'Fashion & Retail', vi: 'Thời trang & Bán lẻ' },
};

export const PROJECT_INDUSTRIES = [
  'Banking',
  'FMCG',
  'Insurance',
  'Telecom',
  'Real Estate',
  'E-commerce',
  'Education',
  'Healthcare',
  'Automotive',
  'Travel & Hospitality',
  'F&B',
  'Technology',
  'Logistics',
  'Beauty & Cosmetics',
  'Fashion & Retail',
];

export function industryLabel(industry?: string | null, lang: 'en' | 'vi' = 'en'): string | null {
  if (!industry) return null;
  return INDUSTRY_LABELS[industry.trim().toLowerCase()]?.[lang] || industry;
}
