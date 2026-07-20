export type TrendingPeriod = 'week' | 'month';

// Simulated trending topics — no live data source wired up yet. Banking is
// pre-seeded with realistic content; any other industry falls back to a
// generic templated list so the endpoint always returns something usable.

const BANKING_WEEKLY: string[] = [
  'Which bank offers the highest savings interest rate this week?',
  'Which bank offers free 24/7 interbank transfers right now?',
  'How to open a credit card online with same-day approval',
  'Which bank has the best credit card cashback offer this month?',
  'How biometric verification works for transfers under the latest regulation',
  'Which digital banking app is the most stable and bug-free right now?',
  'Which bank offers same-day disbursement on consumer loans?',
  'Which bank charges the lowest SMS banking fee?',
  'How to check your credit score online for free',
  'Which bank is running a promo for new card sign-ups?',
  'Comparing cross-network ATM withdrawal fees between banks',
  'Which digital bank lets you open an account 100% online, no branch visit needed?',
  'How to safely link an e-wallet to your bank account',
  'Which bank is raising deposit rates this week?',
  'Which app offers the lowest fees for international money transfers?',
  'How to safely unlink your bank account from an e-wallet',
  'Which bank was mentioned most for transaction outages this past week?',
];

const BANKING_MONTHLY: string[] = [
  'Which digital bank is best for beginners in 2026?',
  'Comparing savings rates across terms among major banks',
  'Digital transformation trends in the banking sector',
  'New regulatory requirements on biometric authentication',
  'Which bank has the best home loan rates this month?',
  'Comparing account maintenance fees across digital banks',
  'Which bank is safest for long-term savings deposits?',
  'Which credit card suits new graduates entering the workforce?',
  'The trend of using AI in bank customer service',
  "Which bank's app is rated highest on the App Store/Google Play?",
  'Comparing unsecured consumer loan rates between banks',
  'Which bank is expanding its branch/ATM network the fastest?',
  'Cashless payment trends this month',
  'Which bank gets the most customer service complaints?',
  'Comparing monthly free transfer limits between apps',
  'Which bank is leading in digital identity verification?',
];

function genericWeekly(industry: string): string[] {
  return [
    `Which brand in the ${industry} industry is getting the most attention this week?`,
    `What's the standout trend in the ${industry} industry this past week?`,
    `Which product or service in the ${industry} industry is drawing the most interest right now?`,
    `Are there any notable promotions in the ${industry} industry this week?`,
    `What are users complaining about most in the ${industry} industry this week?`,
    `Which competitor in the ${industry} industry just launched a new feature or product?`,
    `What's the most-searched question about the ${industry} industry this week?`,
    `Any regulatory or policy changes affecting the ${industry} industry this week?`,
    `What review about the ${industry} industry is going viral on social media?`,
    `How are prices trending in the ${industry} industry this week?`,
    `Which brand in the ${industry} industry got the worst reviews this week?`,
    `Any notable event or launch in the ${industry} industry this week?`,
  ];
}

function genericMonthly(industry: string): string[] {
  return [
    `What's the biggest trend in the ${industry} industry this month?`,
    `Which brand leads the market share in the ${industry} industry right now?`,
    `Comparing the top choices in the ${industry} industry this month`,
    `What should a beginner choose in the ${industry} industry?`,
    `Any new regulations or policies affecting the ${industry} industry this month?`,
    `Overall service quality review for the ${industry} industry this past month`,
    `What new technology trend is affecting the ${industry} industry?`,
    `Which brand in the ${industry} industry is growing fastest this month?`,
    `Comparing costs/pricing among popular choices in the ${industry} industry`,
    `What risks should users be aware of when choosing a ${industry} service?`,
    `How is the ${industry} industry changing amid digital transformation?`,
    `Which brand in the ${industry} industry got the most negative mentions this past month?`,
  ];
}

const BANKING_ALIASES = ['ngân hàng', 'banking', 'tài chính', 'fintech', 'ví điện tử', 'e-wallet', 'bank', 'financial services'];

function isBankingIndustry(industry: string): boolean {
  const key = industry.trim().toLowerCase();
  return BANKING_ALIASES.some((alias) => key.includes(alias));
}

export function getTrending(industry: string, period: TrendingPeriod): string[] {
  if (isBankingIndustry(industry)) {
    return period === 'week' ? BANKING_WEEKLY : BANKING_MONTHLY;
  }
  return period === 'week' ? genericWeekly(industry) : genericMonthly(industry);
}
