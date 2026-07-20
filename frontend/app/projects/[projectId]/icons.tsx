const common = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function IconOverview() {
  return (
    <svg {...common}>
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.3" />
      <rect x="8.5" y="1.5" width="6" height="6" rx="1.3" />
      <rect x="1.5" y="8.5" width="6" height="6" rx="1.3" />
      <rect x="8.5" y="8.5" width="6" height="6" rx="1.3" />
    </svg>
  );
}

export function IconRanking() {
  return (
    <svg {...common}>
      <line x1="2" y1="14" x2="2" y2="8" />
      <line x1="8" y1="14" x2="8" y2="3" />
      <line x1="14" y1="14" x2="14" y2="6" />
    </svg>
  );
}

export function IconSentiment() {
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M5.3 9.4c.7.9 1.7 1.4 2.7 1.4s2-.5 2.7-1.4" />
      <circle cx="5.8" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10.2" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconGap() {
  return (
    <svg {...common}>
      <path d="M9 1.5 3 9h4l-1 5.5 6-8H8L9 1.5Z" />
    </svg>
  );
}

export function IconAmplify() {
  return (
    <svg {...common}>
      <path d="M8 1.5 9.3 5 13 6.2 9.3 7.4 8 11l-1.3-3.6L3 6.2l3.7-1.2L8 1.5Z" />
      <path d="M13 10.5 13.6 12 15 12.6l-1.4.5-.6 1.4-.5-1.4-1.4-.5 1.4-.6.5-1.5Z" />
    </svg>
  );
}

export function IconAgent() {
  return (
    <svg {...common}>
      <rect x="3" y="5.5" width="10" height="7.5" rx="2" />
      <line x1="8" y1="2.2" x2="8" y2="5.5" />
      <circle cx="8" cy="2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="5.8" cy="9.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="10.2" cy="9.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTarget() {
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="6.2" />
      <circle cx="8" cy="8" r="3.4" />
      <circle cx="8" cy="8" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSignOut() {
  return (
    <svg {...common}>
      <path d="M6.5 2.2H3.6a1 1 0 0 0-1 1v9.6a1 1 0 0 0 1 1h2.9" />
      <line x1="14" y1="8" x2="6.3" y2="8" />
      <path d="M10.8 5 14 8l-3.2 3" />
    </svg>
  );
}
