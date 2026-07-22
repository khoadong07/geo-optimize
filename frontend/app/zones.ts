export type Zone = 'vietnam' | 'thailand' | 'indonesia' | 'international';

export const ZONE_OPTIONS: { value: Zone; label: string; flag: string }[] = [
  { value: 'vietnam', label: 'Vietnam', flag: '🇻🇳' },
  { value: 'thailand', label: 'Thailand', flag: '🇹🇭' },
  { value: 'indonesia', label: 'Indonesia', flag: '🇮🇩' },
  { value: 'international', label: 'International', flag: '🌐' },
];

export function zoneLabel(zone?: string | null): string | null {
  if (!zone) return null;
  return ZONE_OPTIONS.find((z) => z.value === zone)?.label || zone;
}
