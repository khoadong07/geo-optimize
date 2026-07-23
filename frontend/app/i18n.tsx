'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'vi';

export interface Translations {
  nav: { product: string; reports: string; pricing: string; trial: string; signIn: string; startTrial: string };
  hero: {
    eyebrow: string;
    h1Pre: string;
    h1Em: string;
    h1Post: string;
    lede: string;
    startTrial: string;
    signIn: string;
    trustPills: string[];
  };
  demo: {
    liveLabel: string;
    simulated: string;
    query: string;
    waiting: string;
    answer: string;
    brand: string;
    rank: string;
    positive: string;
  };
  steps: { eyebrow: string; h2: string; lede: string; items: { title: string; body: string }[] };
  features: { eyebrow: string; h2: string; lede: string; items: { title: string; body: string }[] };
  roadmap: { eyebrow: string; h2: string; lede: string; comingSoon: string; items: { title: string; body: string }[] };
  pricing: {
    eyebrow: string;
    h2: string;
    lede: string;
    mostPopular: string;
    plans: { name: string; price: string; period: string; desc: string; features: string[]; cta: string; slug: string }[];
    footnote: string;
  };
  trial: {
    eyebrow: string;
    h2: string;
    lede: string;
    name: string;
    email: string;
    company: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    genericError: string;
    successTitle: string;
    successBody: string;
  };
  footer: { product: string; pricing: string; signIn: string; copyright: string };
  reports: {
    eyebrow: string;
    h2: string;
    lede: string;
    filterAll: string;
    categories: Record<string, string>;
    sortLabel: string;
    sortNewest: string;
    free: string;
    comingSoon: string;
    previewCta: string;
    downloadCta: string;
    buyCta: string;
    priceLabel: string;
    emptyTitle: string;
    emptyBody: string;
  };
  checkout: {
    backToPricing: string;
    eyebrow: string;
    planLabel: string;
    priceLabel: string;
    qrTitle: string;
    qrPlaceholder: string;
    instructions: string;
    contactCta: string;
    notFoundTitle: string;
    notFoundBody: string;
    backHome: string;
  };
  reportCheckout: {
    backToReports: string;
    steps: string[];
    orderLabel: string;
    vatLabel: string;
    totalLabel: string;
    emailLabel: string;
    emailPlaceholder: string;
    companyLabel: string;
    discountLabel: string;
    licenseLabel: string;
    continueCta: string;
    submitting: string;
    genericError: string;
    paymentMethods: string[];
    qrScanHint: string;
    qrWebhookHint: string;
    simulatePayCta: string;
    payingCta: string;
    downloadTitle: string;
    downloadBody: string;
    downloadCta: string;
    notFoundTitle: string;
    notFoundBody: string;
    backHome: string;
  };
  app: {
    common: {
      project: string;
      configuration: string;
      loading: string;
      cancel: string;
      save: string;
      saving: string;
      deleting: string;
      edit: string;
      delete: string;
      close: string;
      sendingRequest: string;
      sending: string;
      running: string;
      previous: string;
      next: string;
      pageOf: string;
      viewResponse: string;
      notEnoughDataTrend: string;
      today: string;
      sortByStatus: string;
      statusAll: string;
      statusCompetitorLeading: string;
      statusTracking: string;
      statusNoData: string;
      statusTargetMet: string;
      comingSoon: string;
    };
    layout: {
      loadingProject: string;
      couldNotLoadProject: string;
      backToProjects: string;
      allProjects: string;
      navSectionProject: string;
      navSectionConfiguration: string;
      navOverview: string;
      navPrompts: string;
      navSentiment: string;
      navGapCitation: string;
      navAmplify: string;
      navAiAgent: string;
      navTarget: string;
      signedIn: string;
      signOut: string;
      uncategorized: string;
      competitors: string;
      competitorsNone: string;
      windowLast14: string;
      newPrompt: string;
    };
    overview: {
      visibilityScore: string;
      avgOverDays: string;
      targetGap: string;
      targetMet: string;
      belowTarget: string;
      shareOfVoice: string;
      byMentionCount: string;
      youSuffix: string;
      noBrandMentions: string;
      trend: string;
      trendDays: string;
      trendDefault: string;
      trendSub: string;
      trackedByPlatform: string;
      activeCount: string;
      appears: string;
      noRunsYet: string;
      promptsTracked: string;
      reRunTracking: string;
      runningProgress: string;
      everyPromptMetTooltip: string;
      onlyRerunTooltip: string;
      thPrompt: string;
      thRecentSignal: string;
      thVisibility: string;
      thSovVsCompetitor: string;
      thStatus: string;
      noPromptsFilter: string;
      noAiPlatformTitle: string;
      noAiPlatformBody: string;
      goToTargetPosition: string;
      noDataYetTitle: string;
      readyWithPrompts: string;
      runTrackingNow: string;
      noPromptsYetInline: string;
      createPromptSetFirst: string;
      runningTracking: string;
      failedSuffix: string;
      lastRunFailed: string;
      couldNotLoadOverview: string;
      everyPromptMetError: string;
      couldNotStartRun: string;
    };
    prompts: {
      title: string;
      subtitle: string;
      couldNotLoadList: string;
      generateTitle: string;
      generateDesc: string;
      unspecified: string;
      trendingTopicsLabel: string;
      trendingWeek: string;
      trendingMonth: string;
      topicsSelected: string;
      intentLabel: string;
      generating: string;
      generate7: string;
      promptSetName: string;
      adding: string;
      addSelected: string;
      couldNotGenerate: string;
      couldNotLoadTrending: string;
      addManualTitle: string;
      addManualDesc: string;
      promptSetNamePlaceholder: string;
      promptTextLabel: string;
      promptTextPlaceholder: string;
      creating: string;
      addPrompt: string;
      couldNotAddPrompts: string;
      addedPromptsTo: string;
      couldNotCreatePrompt: string;
      addedPromptTo: string;
      allPrompts: string;
      deleteSelected: string;
      noPromptsMatch: string;
      noPromptsYetTitle: string;
      noPromptsYetBody: string;
      couldNotUpdatePrompt: string;
      promptUpdated: string;
      deleteConfirmTitle: string;
      deleteCannotUndo: string;
      andMore: string;
      deleteButton: string;
      deletedCount: string;
      failedDeleteCount: string;
      intentLabels: Record<string, string>;
    };
    sentiment: {
      subtitle: string;
      overviewTitle: string;
      overviewSub: string;
      positiveLabel: string;
      neutralLabel: string;
      negativeLabel: string;
      notApplicableLabel: string;
      noRunsRecorded: string;
      byPlatformTitle: string;
      byPlatformSub: string;
      byIntentTitle: string;
      byIntentSub: string;
      positiveTrendTitle: string;
      positiveTrendSub: string;
      topTopicsTitle: string;
      topTopicsSub: string;
      noTopicsExtracted: string;
      recentRuns: string;
      allPlatforms: string;
      thPrompt: string;
      thPlatform: string;
      thSentiment: string;
      thReasoning: string;
      thTime: string;
      noRunsYetTitle: string;
      noRunsYetAllBody: string;
      noRunsYetFilteredBody: string;
      couldNotLoadSentiment: string;
      couldNotLoadRunList: string;
      todayPositive: string;
    };
    gapCitation: {
      subtitlePre: string;
      subtitleLink: string;
      subtitlePost: string;
      noWebsiteTitle: string;
      noWebsiteBody: string;
      noAuditYetTitle: string;
      runFirstAudit: string;
      runAuditNow: string;
      runAuditAgain: string;
      geoScoreTitle: string;
      auditedAt: string;
      breakdownTitle: string;
      breakdownSub: string;
      recommendationsTitle: string;
      noRecommendations: string;
      auditingDomain: string;
      auditFailed: string;
      couldNotLoadAudit: string;
      couldNotStartAudit: string;
      skillModalTitle: string;
      skillModalDesc: string;
      checkLabels: Record<string, string>;
      bandLabels: Record<string, string>;
    };
    target: {
      subtitle: string;
      platformsTitle: string;
      platformsSub: string;
      geminiNote: string;
      openaiNote: string;
      targetFrequencyTitle: string;
      targetScoreLabel: string;
      runsPerPromptLabel: string;
      competitorsLabel: string;
      competitorsPlaceholder: string;
      websiteLabel: string;
      websitePlaceholder: string;
      websiteHint: string;
      saveConfig: string;
      couldNotSaveConfig: string;
      configSaved: string;
    };
    aiAgent: { subtitle: string; comingSoonBody: string };
    amplify: { subtitle: string; comingSoonBody: string };
  };
}

export function interpolate(str: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce((acc, [key, value]) => acc.split(`{{${key}}}`).join(String(value)), str);
}

export const translations: Record<Lang, Translations> = {
  en: {
    nav: { product: 'Product', reports: 'Reports', pricing: 'Pricing', trial: 'Trial', signIn: 'Sign in', startTrial: 'Start free trial' },
    hero: {
      eyebrow: 'GEO · Generative Engine Optimization',
      h1Pre: 'Know if AI ',
      h1Em: 'recommends',
      h1Post: ' your brand.',
      lede: 'GeoBase tracks how often, where, and how positively AI answer engines like Gemini and ChatGPT mention your brand — so you can act before competitors do.',
      startTrial: 'Start free trial',
      signIn: 'Sign in',
      trustPills: ['Tracks Gemini & OpenAI', 'LLM-judged sentiment', 'Built for the Vietnamese market'],
    },
    demo: {
      liveLabel: 'Live tracking demo',
      simulated: 'Simulated example',
      query: 'Which digital bank has the best mobile app experience?',
      waiting: 'Waiting for query...',
      answer:
        'For everyday banking, {{brand}} stands out for its mobile app — fast transfers, biometric login, and responsive support.',
      brand: 'Meridian Bank',
      rank: 'Rank',
      positive: 'Positive',
    },
    steps: {
      eyebrow: 'How it works',
      h2: 'From question to fix, in three steps',
      lede: 'GeoBase runs the same loop your customers do — ask an AI assistant, see what it says, then close the gap.',
      items: [
        { title: 'Ask', body: 'We simulate the real questions your customers type into AI assistants — generated from your industry, brand, and live trending topics.' },
        { title: 'Track', body: 'Every response is scored for brand visibility, ranking position, and sentiment — across every AI platform you enable.' },
        { title: 'Improve', body: "Gap & Citation audits your website's AI-readiness and hands you a fix list, so the next answer favors you." },
      ],
    },
    features: {
      eyebrow: 'Everything you need',
      h2: 'Built around how AI answer engines actually work',
      lede: 'Every metric below comes from real tracked runs against live AI platforms — not estimates.',
      items: [
        { title: 'Visibility scoring', body: 'Rank-based scoring shows exactly where your brand lands in every AI answer, not just whether it was mentioned.' },
        { title: 'Sentiment analysis', body: 'An LLM-as-judge reads every response and grades tone — positive, neutral, or negative — with its reasoning.' },
        { title: 'Multi-platform tracking', body: 'Gemini and OpenAI today, with more AI answer engines on the roadmap.' },
        { title: 'AI-assisted prompts', body: 'Generate on-brand, on-trend questions in one click, tuned to your industry and competitors.' },
        { title: 'Trending topics', body: 'Pull real weekly and monthly industry trends straight into your prompt generation, so tracking stays current.' },
        { title: 'GEO site audit', body: 'A technical readiness score for your site — schema markup, llms.txt, robots.txt, and more.' },
      ],
    },
    roadmap: {
      eyebrow: 'Coming next',
      h2: 'From insight to action',
      lede: 'Two upcoming modules that turn what GeoBase learns into real content and distribution.',
      comingSoon: 'Coming soon',
      items: [
        { title: 'Amplify', body: 'Turns tracking data into a prioritized action list — see exactly which prompts are missing their visibility target, and what to publish, update, or pitch next to close the gap.' },
        { title: 'AI Content Agent', body: 'An agent that drafts the actual content built to amplify your visibility — articles, FAQ pages, and PR angles written to answer the exact questions AI engines are asked.' },
      ],
    },
    pricing: {
      eyebrow: 'Pricing',
      h2: 'Simple plans that scale with your brand',
      lede: 'Every plan starts with a free trial. No credit card required.',
      mostPopular: 'Popular',
      plans: [
        {
          name: 'Starter VN',
          price: '₫2.5M',
          period: '/month',
          desc: '',
          features: ['1 brand', 'industry benchmark', '2 AI platforms', 'weekly runs', 'email alerts'],
          cta: 'Buy via QR',
          slug: 'starter-vn',
        },
        {
          name: 'Growth VN',
          price: '₫7.5M',
          period: '/month',
          desc: '',
          features: ['Everything in Starter', '30 custom prompts', 'competitor analysis', 'Amplify', 'monthly report export'],
          cta: 'Buy via QR',
          slug: 'growth-vn',
        },
        {
          name: 'Enterprise',
          price: 'Get a quote',
          period: '',
          desc: '',
          features: ['Multi-brand', 'custom prompt sets', 'Zalo alerts', 'managed service by Kompa', 'e-invoice & bank transfer'],
          cta: 'Contact sales',
          slug: 'enterprise',
        },
      ],
      footnote: 'Prices exclude VAT · Billed annually · Renews via reminder (no auto-charge) · Full e-invoice provided',
    },
    trial: {
      eyebrow: 'Free trial',
      h2: "Start tracking your brand's AI visibility",
      lede: "Tell us about your brand — we'll create your account instantly and email you sign-in access. No credit card required, cancel anytime.",
      name: 'Full name',
      email: 'Work email',
      company: 'Company',
      message: 'Message (optional)',
      messagePlaceholder: 'Which brand and industry would you like to track?',
      submit: 'Request access',
      submitting: 'Submitting...',
      genericError: 'Could not submit your request. Please try again.',
      successTitle: 'Your account is on its way',
      successBody: "Thanks, {{name}} — we've created your trial account and sent sign-in details to {{email}}. Check your inbox in the next few minutes.",
    },
    footer: {
      product: 'Product',
      pricing: 'Pricing',
      signIn: 'Sign in',
      copyright: 'All rights reserved.',
    },
    reports: {
      eyebrow: 'Reports',
      h2: 'AI Visibility reports',
      lede: 'Real benchmark data from GeoBase, published by our team.',
      filterAll: 'All',
      categories: { banking: 'Banking', fmcg: 'FMCG', insurance: 'Insurance', telecom: 'Telecom', real_estate: 'Real Estate', general: 'General' },
      sortLabel: 'Sort',
      sortNewest: 'Newest',
      free: 'Free',
      comingSoon: 'Coming soon',
      previewCta: 'Preview',
      downloadCta: 'Download free',
      buyCta: 'Buy & download',
      priceLabel: 'Price',
      emptyTitle: 'No reports published yet',
      emptyBody: 'Check back soon — new AI Visibility reports are on the way.',
    },
    app: {
      common: {
        project: 'Project',
        configuration: 'Configuration',
        loading: 'Loading...',
        cancel: 'Cancel',
        save: 'Save',
        saving: 'Saving...',
        deleting: 'Deleting...',
        edit: 'Edit',
        delete: 'Delete',
        close: 'Close',
        sendingRequest: 'Sending request...',
        sending: 'Sending...',
        running: 'Running...',
        previous: 'Previous',
        next: 'Next',
        pageOf: 'Page {{page}} of {{total}}',
        viewResponse: 'View response',
        notEnoughDataTrend: 'Not enough data to chart a trend yet — needs at least 2 days with runs.',
        today: 'Today',
        sortByStatus: 'Sort by status',
        statusAll: 'All',
        statusCompetitorLeading: 'Competitor leading',
        statusTracking: 'Tracking',
        statusNoData: 'No data',
        statusTargetMet: 'Target met',
        comingSoon: 'Coming soon',
      },
      layout: {
        loadingProject: 'Loading project...',
        couldNotLoadProject: 'Could not load project.',
        backToProjects: 'Back to projects',
        allProjects: 'All projects',
        navSectionProject: 'Project',
        navSectionConfiguration: 'Configuration',
        navOverview: 'Overview',
        navPrompts: 'Ranking & Prompts',
        navSentiment: 'Sentiment',
        navGapCitation: 'Gap & Citation',
        navAmplify: 'Amplify',
        navAiAgent: 'AI Agent',
        navTarget: 'Target Position',
        signedIn: 'Signed in',
        signOut: 'Sign out',
        uncategorized: 'Uncategorized',
        competitors: 'Competitors',
        competitorsNone: '· none set',
        windowLast14: 'Window · last 14 days',
        newPrompt: '+ New prompt',
      },
      overview: {
        visibilityScore: 'Visibility Score',
        avgOverDays: 'Avg. over {{days}} days',
        targetGap: 'Target: {{target}} · Gap',
        targetMet: 'Target met',
        belowTarget: 'Below target — amplifying',
        shareOfVoice: 'Share of Voice',
        byMentionCount: 'By mention count',
        youSuffix: ' (you)',
        noBrandMentions: 'No brand or competitor mentions yet.',
        trend: 'Trend',
        trendDays: '({{n}}d)',
        trendDefault: '(14d)',
        trendSub: 'Visibility Score',
        trackedByPlatform: 'Tracked by AI platform',
        activeCount: '{{n}} active',
        appears: 'Appears {{pct}}% · {{n}} runs',
        noRunsYet: 'No runs yet',
        promptsTracked: 'Prompts tracked',
        reRunTracking: 'Re-run tracking ({{n}} below target)',
        runningProgress: 'Running ({{done}}/{{total}})',
        everyPromptMetTooltip: 'Every prompt has already met its target',
        onlyRerunTooltip: 'Only re-run {{n}} prompts below target',
        thPrompt: 'Prompt',
        thRecentSignal: 'Recent signal',
        thVisibility: 'Visibility',
        thSovVsCompetitor: 'SOV vs. competitor',
        thStatus: 'Status',
        noPromptsFilter: 'No prompts match this filter.',
        noAiPlatformTitle: 'No AI platform enabled yet',
        noAiPlatformBody: 'Go to Target Position to enable Gemini/OpenAI before running tracking for the first time.',
        goToTargetPosition: 'Go to Target Position',
        noDataYetTitle: 'No data yet — run tracking for the first time',
        readyWithPrompts: 'This project is ready with {{prompts}} prompts and {{platforms}} AI platforms.',
        runTrackingNow: 'Run tracking now',
        noPromptsYetInline: 'No prompts yet.',
        createPromptSetFirst: 'Create a prompt set first',
        runningTracking: 'Running tracking... {{done}}/{{total}} done',
        failedSuffix: ' ({{n}} failed)',
        lastRunFailed: 'The last run failed entirely — try again.',
        couldNotLoadOverview: 'Could not load overview data.',
        everyPromptMetError: 'Every prompt has already met its target — nothing to re-run.',
        couldNotStartRun: 'Could not start the run.',
      },
      prompts: {
        title: 'Ranking & Prompts',
        subtitle: 'Every tracked prompt and how each question ranks for visibility.',
        couldNotLoadList: 'Could not load the prompt list.',
        generateTitle: 'Generate questions with AI',
        generateDesc: 'Based on the industry "{{industry}}", brand "{{brand}}", and configured competitors — generates 7 questions for the intent selected below.',
        unspecified: 'unspecified',
        trendingTopicsLabel: 'Industry trending topics (optional — keeps questions on-trend)',
        trendingWeek: 'Trending this week',
        trendingMonth: 'Trending this month',
        topicsSelected: '{{n}} topics selected',
        intentLabel: 'Intent',
        generating: 'Generating...',
        generate7: 'Generate 7 questions',
        promptSetName: 'Prompt set name',
        adding: 'Adding...',
        addSelected: 'Add {{n}} selected',
        couldNotGenerate: 'Could not generate questions.',
        couldNotLoadTrending: 'Could not load trending topics.',
        addManualTitle: 'Add a prompt manually',
        addManualDesc: 'Write a specific question instead of letting AI generate one.',
        promptSetNamePlaceholder: 'e.g. Discovery — Acme',
        promptTextLabel: 'Prompt text',
        promptTextPlaceholder: "What's the safest app for transferring money?",
        creating: 'Creating...',
        addPrompt: '+ Add prompt',
        couldNotAddPrompts: 'Could not add prompts.',
        addedPromptsTo: 'Added {{n}} prompts to "{{name}}".',
        couldNotCreatePrompt: 'Could not create prompt.',
        addedPromptTo: 'Added prompt to "{{name}}".',
        allPrompts: 'All prompts',
        deleteSelected: 'Delete selected ({{n}})',
        noPromptsMatch: 'No prompts match this filter.',
        noPromptsYetTitle: 'No prompts yet',
        noPromptsYetBody: 'Use the forms above to add your first one.',
        couldNotUpdatePrompt: 'Could not update prompt.',
        promptUpdated: 'Prompt updated.',
        deleteConfirmTitle: 'Delete {{n}} prompt{{s}}?',
        deleteCannotUndo: 'This cannot be undone.',
        andMore: 'and {{n}} more...',
        deleteButton: 'Delete {{n}} prompt{{s}}',
        deletedCount: 'Deleted {{n}} prompt{{s}}.',
        failedDeleteCount: 'Failed to delete {{n}} prompt{{s}}.',
        intentLabels: { Discovery: 'Discovery', Comparison: 'Comparison', Branded: 'Branded', 'Long-tail': 'Long-tail' },
      },
      sentiment: {
        subtitle: "How the AI's response treats the brand, scored by an LLM-as-judge.",
        overviewTitle: 'Sentiment overview',
        overviewSub: 'Across every recorded run, all platforms',
        positiveLabel: 'Positive',
        neutralLabel: 'Neutral',
        negativeLabel: 'Negative',
        notApplicableLabel: 'Not applicable',
        noRunsRecorded: 'No runs recorded yet.',
        byPlatformTitle: 'By platform',
        byPlatformSub: 'Sentiment split per AI engine',
        byIntentTitle: 'By intent',
        byIntentSub: 'Sentiment split per prompt intent',
        positiveTrendTitle: 'Positive-rate trend',
        positiveTrendSub: 'Share of positive runs per day',
        topTopicsTitle: 'Top topics',
        topTopicsSub: 'Most frequent themes the judge extracted',
        noTopicsExtracted: 'No topics extracted yet.',
        recentRuns: 'Recent runs',
        allPlatforms: 'All platforms',
        thPrompt: 'Prompt',
        thPlatform: 'Platform',
        thSentiment: 'Sentiment',
        thReasoning: 'Reasoning',
        thTime: 'Time',
        noRunsYetTitle: 'No runs yet',
        noRunsYetAllBody: 'Run tracking from the Overview page to start recording sentiment.',
        noRunsYetFilteredBody: 'No runs recorded on {{platform}}.',
        couldNotLoadSentiment: 'Could not load sentiment data.',
        couldNotLoadRunList: 'Could not load the run list.',
        todayPositive: 'Today · {{pct}}% positive',
      },
      gapCitation: {
        subtitlePre: 'A technical GEO audit of the website — how ready it is for AI crawlers to crawl and cite (scored by ',
        subtitleLink: 'geo-optimizer-skill',
        subtitlePost: ').',
        noWebsiteTitle: 'This project has no website set',
        noWebsiteBody: 'Set an "Official website" on Target Position to run a GEO audit.',
        noAuditYetTitle: 'No audit yet',
        runFirstAudit: 'Run the first audit for {{domain}}.',
        runAuditNow: 'Run audit now',
        runAuditAgain: 'Run audit again',
        geoScoreTitle: 'GEO score',
        auditedAt: 'Audited {{date}}',
        breakdownTitle: 'Breakdown by category',
        breakdownSub: '8 categories scored by geo-optimizer-skill',
        recommendationsTitle: 'Recommendations',
        noRecommendations: 'No recommendations — every category checks out.',
        auditingDomain: 'Auditing {{domain}} — fetching the live page can take 10-60s...',
        auditFailed: 'Audit failed: {{message}}',
        couldNotLoadAudit: 'Could not load the audit result.',
        couldNotStartAudit: 'Could not start the audit.',
        skillModalTitle: 'geo-optimizer-skill',
        skillModalDesc: 'The third-party audit tool GeoBase uses on this page.',
        checkLabels: {
          robots_txt: 'Robots.txt',
          llms_txt: 'llms.txt',
          schema_jsonld: 'Schema JSON-LD',
          meta_tags: 'Meta tags',
          content: 'Content',
          signals: 'Page signals',
          ai_discovery: 'AI discovery',
          brand_entity: 'Brand entity',
        },
        bandLabels: { excellent: 'Excellent', good: 'Good', foundation: 'Foundation', critical: 'Critical' },
      },
      target: {
        subtitle: 'Choose which AI platforms to track, the Visibility Score target, and how many times to run each prompt.',
        platformsTitle: 'AI platforms tracked',
        platformsSub: 'Prompts are sent to the selected platforms whenever tracking runs.',
        geminiNote: 'Grounding with Google Search: on',
        openaiNote: 'No citations unless the web-search tool is enabled',
        targetFrequencyTitle: 'Target & frequency',
        targetScoreLabel: 'Target Visibility Score (0-100)',
        runsPerPromptLabel: 'Runs per prompt (reduces noise from LLM variance)',
        competitorsLabel: 'Competitors tracked (comma-separated)',
        competitorsPlaceholder: 'Competitor A, Competitor B',
        websiteLabel: 'Official website',
        websitePlaceholder: 'example.com',
        websiteHint: 'Used to run the GEO audit on the Gap & Citation page.',
        saveConfig: 'Save configuration',
        couldNotSaveConfig: 'Could not save configuration.',
        configSaved: 'Configuration saved.',
      },
      aiAgent: {
        subtitle: 'Automated tasks: re-run tracking on a schedule, alert on rank drops, suggest new prompts.',
        comingSoonBody: "Automation hasn't been built yet — tracking runs are triggered manually from Overview for now.",
      },
      amplify: {
        subtitle: "Suggested actions to improve the Visibility Score for prompts that haven't hit their target yet.",
        comingSoonBody: "Content and PR amplification suggestions haven't been built yet.",
      },
    },
    checkout: {
      backToPricing: '← Back to pricing',
      eyebrow: 'Checkout',
      planLabel: 'Selected plan',
      priceLabel: 'Amount',
      qrTitle: 'Payment QR',
      qrPlaceholder: "We're finalizing the payment QR for this plan.",
      instructions: 'Our team will send you the payment QR and bank transfer details directly, then activate your plan as soon as payment is confirmed.',
      contactCta: 'Contact us to complete payment',
      notFoundTitle: 'Plan not found',
      notFoundBody: "We couldn't find that plan. Please pick a plan from the pricing page.",
      backHome: 'Back to pricing',
    },
    reportCheckout: {
      backToReports: '← Back to reports',
      steps: ['Info', 'Payment', 'Download'],
      orderLabel: 'Order',
      vatLabel: 'VAT (10%)',
      totalLabel: 'Total',
      emailLabel: 'Email to receive the file *',
      emailPlaceholder: 'a.nguyen@brand.com',
      companyLabel: 'Company name + Tax ID (for invoice — optional)',
      discountLabel: 'Discount code',
      licenseLabel: 'I agree to the single-organization license terms',
      continueCta: 'Continue',
      submitting: 'Submitting...',
      genericError: 'Could not create the order. Please try again.',
      paymentMethods: ['VietQR', 'MoMo', 'International card'],
      qrScanHint: 'Scan with any banking app',
      qrWebhookHint: 'Auto-confirms via webhook — no need to click anything else',
      simulatePayCta: '— Simulate: paid →',
      payingCta: 'Confirming...',
      downloadTitle: 'Payment successful',
      downloadBody: 'Your report is ready. A copy has also been emailed to you.',
      downloadCta: 'Download report',
      notFoundTitle: 'Report not found',
      notFoundBody: "We couldn't find that report. Please pick one from the Reports section.",
      backHome: 'Back to reports',
    },
  },
  vi: {
    nav: { product: 'Sản phẩm', reports: 'Báo cáo', pricing: 'Bảng giá', trial: 'Dùng thử', signIn: 'Đăng nhập', startTrial: 'Dùng thử miễn phí' },
    hero: {
      eyebrow: 'GEO · Tối ưu hóa cho công cụ AI',
      h1Pre: 'Biết ngay khi AI ',
      h1Em: 'gợi ý',
      h1Post: ' thương hiệu của bạn.',
      lede: 'GeoBase theo dõi tần suất, vị trí và mức độ tích cực khi các công cụ trả lời AI như Gemini và ChatGPT nhắc đến thương hiệu của bạn — để bạn hành động trước đối thủ.',
      startTrial: 'Dùng thử miễn phí',
      signIn: 'Đăng nhập',
      trustPills: ['Theo dõi Gemini & OpenAI', 'Phân tích cảm xúc bằng LLM', 'Xây dựng cho thị trường Việt Nam'],
    },
    demo: {
      liveLabel: 'Bản demo theo dõi trực tiếp',
      simulated: 'Ví dụ mô phỏng',
      query: 'Ngân hàng số nào có trải nghiệm ứng dụng di động tốt nhất?',
      waiting: 'Đang chờ câu hỏi...',
      answer:
        'Đối với ngân hàng số hằng ngày, {{brand}} nổi bật với ứng dụng di động — chuyển tiền nhanh, đăng nhập sinh trắc học và hỗ trợ phản hồi nhanh.',
      brand: 'Meridian Bank',
      rank: 'Hạng',
      positive: 'Tích cực',
    },
    steps: {
      eyebrow: 'Cách hoạt động',
      h2: 'Từ câu hỏi đến giải pháp, chỉ trong ba bước',
      lede: 'GeoBase thực hiện đúng quy trình khách hàng của bạn làm — hỏi trợ lý AI, xem câu trả lời, rồi lấp đầy khoảng trống.',
      items: [
        { title: 'Hỏi', body: 'Chúng tôi mô phỏng những câu hỏi thực tế mà khách hàng của bạn gõ vào các trợ lý AI — được tạo ra từ ngành, thương hiệu và xu hướng thịnh hành của bạn.' },
        { title: 'Theo dõi', body: 'Mỗi câu trả lời được chấm điểm về độ hiển thị thương hiệu, vị trí xếp hạng và cảm xúc — trên mọi nền tảng AI bạn kích hoạt.' },
        { title: 'Cải thiện', body: 'Gap & Citation kiểm tra mức độ sẵn sàng cho AI của website và đưa ra danh sách việc cần sửa, để câu trả lời tiếp theo có lợi cho bạn.' },
      ],
    },
    features: {
      eyebrow: 'Mọi thứ bạn cần',
      h2: 'Được xây dựng theo cách các công cụ trả lời AI thực sự hoạt động',
      lede: 'Mọi chỉ số dưới đây đến từ các lượt theo dõi thực tế trên các nền tảng AI đang hoạt động — không phải ước tính.',
      items: [
        { title: 'Chấm điểm độ hiển thị', body: 'Chấm điểm theo thứ hạng cho biết chính xác thương hiệu của bạn đứng ở đâu trong mỗi câu trả lời AI, không chỉ là có được nhắc đến hay không.' },
        { title: 'Phân tích cảm xúc', body: 'Một LLM đóng vai trò giám khảo đọc từng câu trả lời và chấm điểm giọng điệu — tích cực, trung lập hoặc tiêu cực — kèm lý giải.' },
        { title: 'Theo dõi đa nền tảng', body: 'Hiện đã có Gemini và OpenAI, với nhiều công cụ trả lời AI khác sẽ được bổ sung.' },
        { title: 'Gợi ý câu hỏi bằng AI', body: 'Tạo các câu hỏi đúng thương hiệu, đúng xu hướng chỉ trong một lần bấm, được tinh chỉnh theo ngành và đối thủ của bạn.' },
        { title: 'Chủ đề xu hướng', body: 'Đưa các xu hướng ngành theo tuần và theo tháng trực tiếp vào việc tạo câu hỏi, giúp việc theo dõi luôn cập nhật.' },
        { title: 'Kiểm tra website theo chuẩn GEO', body: 'Điểm đánh giá mức độ sẵn sàng kỹ thuật cho website của bạn — schema markup, llms.txt, robots.txt và nhiều hơn nữa.' },
      ],
    },
    roadmap: {
      eyebrow: 'Sắp ra mắt',
      h2: 'Từ thông tin chi tiết đến hành động',
      lede: 'Hai module sắp ra mắt biến những gì GeoBase học được thành nội dung và phân phối thực tế.',
      comingSoon: 'Sắp ra mắt',
      items: [
        { title: 'Amplify', body: 'Biến dữ liệu theo dõi thành danh sách hành động ưu tiên — xem chính xác câu hỏi nào chưa đạt mục tiêu hiển thị, và nên xuất bản, cập nhật hay đề xuất nội dung gì tiếp theo để lấp đầy khoảng trống.' },
        { title: 'AI Content Agent', body: 'Một tác nhân AI soạn thảo nội dung thực tế nhằm tăng độ hiển thị của bạn — bài viết, trang FAQ và góc độ truyền thông được viết để trả lời đúng những câu hỏi mà các công cụ AI được hỏi.' },
      ],
    },
    pricing: {
      eyebrow: 'Bảng giá',
      h2: 'Các gói đơn giản, mở rộng theo thương hiệu của bạn',
      lede: 'Mọi gói đều bắt đầu với bản dùng thử miễn phí. Không cần thẻ tín dụng.',
      mostPopular: 'Phổ biến',
      plans: [
        {
          name: 'Starter VN',
          price: '2.5trđ',
          period: '/tháng',
          desc: '',
          features: ['1 thương hiệu', 'benchmark ngành', '2 nền tảng AI', 'chạy hàng tuần', 'cảnh báo email'],
          cta: 'Mua bằng QR',
          slug: 'starter-vn',
        },
        {
          name: 'Growth VN',
          price: '7.5trđ',
          period: '/tháng',
          desc: '',
          features: ['Toàn bộ tính năng Starter', '30 prompt riêng', 'phân tích đối thủ', 'Amplify', 'xuất báo cáo tháng'],
          cta: 'Mua bằng QR',
          slug: 'growth-vn',
        },
        {
          name: 'Enterprise',
          price: 'Báo giá',
          period: '',
          desc: '',
          features: ['Đa thương hiệu', 'prompt set riêng', 'cảnh báo Zalo', 'dịch vụ managed bởi Kompa', 'e-invoice, chuyển khoản'],
          cta: 'Liên hệ sales',
          slug: 'enterprise',
        },
      ],
      footnote: 'Giá chưa gồm VAT · Thanh toán theo năm · Tự gia hạn bằng nhắc hạn (không auto-charge) · Xuất hoá đơn điện tử đầy đủ',
    },
    trial: {
      eyebrow: 'Dùng thử miễn phí',
      h2: 'Bắt đầu theo dõi độ hiển thị AI của thương hiệu bạn',
      lede: 'Cho chúng tôi biết về thương hiệu của bạn — chúng tôi sẽ tạo tài khoản ngay lập tức và gửi thông tin đăng nhập qua email. Không cần thẻ tín dụng, hủy bất cứ lúc nào.',
      name: 'Họ và tên',
      email: 'Email công việc',
      company: 'Công ty',
      message: 'Lời nhắn (không bắt buộc)',
      messagePlaceholder: 'Bạn muốn theo dõi thương hiệu và ngành nào?',
      submit: 'Yêu cầu truy cập',
      submitting: 'Đang gửi...',
      genericError: 'Không thể gửi yêu cầu của bạn. Vui lòng thử lại.',
      successTitle: 'Tài khoản của bạn đang được tạo',
      successBody: 'Cảm ơn {{name}} — chúng tôi đã tạo tài khoản dùng thử và gửi thông tin đăng nhập tới {{email}}. Hãy kiểm tra hộp thư trong vài phút tới.',
    },
    footer: {
      product: 'Sản phẩm',
      pricing: 'Bảng giá',
      signIn: 'Đăng nhập',
      copyright: 'Đã đăng ký bản quyền.',
    },
    reports: {
      eyebrow: 'Báo cáo',
      h2: 'Báo cáo AI Visibility',
      lede: 'Dữ liệu benchmark thật từ GeoBase, được đội ngũ của chúng tôi xuất bản.',
      filterAll: 'Tất cả',
      categories: { banking: 'Ngân hàng', fmcg: 'FMCG', insurance: 'Bảo hiểm', telecom: 'Viễn thông', real_estate: 'BĐS', general: 'Tổng hợp' },
      sortLabel: 'Sắp xếp',
      sortNewest: 'Mới nhất',
      free: 'Miễn phí',
      comingSoon: 'Sắp ra mắt',
      previewCta: 'Xem trước',
      downloadCta: 'Tải miễn phí',
      buyCta: 'Mua & tải',
      priceLabel: 'Giá',
      emptyTitle: 'Chưa có báo cáo nào được xuất bản',
      emptyBody: 'Hãy quay lại sau — các báo cáo AI Visibility mới sắp ra mắt.',
    },
    app: {
      common: {
        project: 'Dự án',
        configuration: 'Cấu hình',
        loading: 'Đang tải...',
        cancel: 'Hủy',
        save: 'Lưu',
        saving: 'Đang lưu...',
        deleting: 'Đang xóa...',
        edit: 'Sửa',
        delete: 'Xóa',
        close: 'Đóng',
        sendingRequest: 'Đang gửi yêu cầu...',
        sending: 'Đang gửi...',
        running: 'Đang chạy...',
        previous: 'Trước',
        next: 'Sau',
        pageOf: 'Trang {{page}} / {{total}}',
        viewResponse: 'Xem câu trả lời',
        notEnoughDataTrend: 'Chưa đủ dữ liệu để vẽ biểu đồ xu hướng — cần ít nhất 2 ngày có lượt chạy.',
        today: 'Hôm nay',
        sortByStatus: 'Sắp xếp theo trạng thái',
        statusAll: 'Tất cả',
        statusCompetitorLeading: 'Đối thủ dẫn trước',
        statusTracking: 'Đang theo dõi',
        statusNoData: 'Chưa có dữ liệu',
        statusTargetMet: 'Đạt mục tiêu',
        comingSoon: 'Sắp ra mắt',
      },
      layout: {
        loadingProject: 'Đang tải dự án...',
        couldNotLoadProject: 'Không thể tải dự án.',
        backToProjects: 'Quay lại danh sách dự án',
        allProjects: 'Tất cả dự án',
        navSectionProject: 'Dự án',
        navSectionConfiguration: 'Cấu hình',
        navOverview: 'Tổng quan',
        navPrompts: 'Xếp hạng & Câu hỏi',
        navSentiment: 'Cảm xúc',
        navGapCitation: 'Gap & Citation',
        navAmplify: 'Amplify',
        navAiAgent: 'AI Agent',
        navTarget: 'Vị trí mục tiêu',
        signedIn: 'Đã đăng nhập',
        signOut: 'Đăng xuất',
        uncategorized: 'Chưa phân loại',
        competitors: 'Đối thủ',
        competitorsNone: '· chưa thiết lập',
        windowLast14: 'Khoảng thời gian · 14 ngày qua',
        newPrompt: '+ Câu hỏi mới',
      },
      overview: {
        visibilityScore: 'Điểm hiển thị',
        avgOverDays: 'Trung bình trong {{days}} ngày',
        targetGap: 'Mục tiêu: {{target}} · Khoảng cách',
        targetMet: 'Đạt mục tiêu',
        belowTarget: 'Dưới mục tiêu — đang khuếch đại',
        shareOfVoice: 'Thị phần tiếng nói',
        byMentionCount: 'Theo số lượt nhắc đến',
        youSuffix: ' (bạn)',
        noBrandMentions: 'Chưa có lượt nhắc đến thương hiệu hoặc đối thủ nào.',
        trend: 'Xu hướng',
        trendDays: '({{n}} ngày)',
        trendDefault: '(14 ngày)',
        trendSub: 'Điểm hiển thị',
        trackedByPlatform: 'Theo dõi theo nền tảng AI',
        activeCount: '{{n}} đang hoạt động',
        appears: 'Xuất hiện {{pct}}% · {{n}} lượt chạy',
        noRunsYet: 'Chưa có lượt chạy nào',
        promptsTracked: 'Câu hỏi được theo dõi',
        reRunTracking: 'Chạy lại theo dõi ({{n}} dưới mục tiêu)',
        runningProgress: 'Đang chạy ({{done}}/{{total}})',
        everyPromptMetTooltip: 'Mọi câu hỏi đã đạt mục tiêu',
        onlyRerunTooltip: 'Chỉ chạy lại {{n}} câu hỏi dưới mục tiêu',
        thPrompt: 'Câu hỏi',
        thRecentSignal: 'Tín hiệu gần đây',
        thVisibility: 'Độ hiển thị',
        thSovVsCompetitor: 'SOV so với đối thủ',
        thStatus: 'Trạng thái',
        noPromptsFilter: 'Không có câu hỏi nào khớp với bộ lọc này.',
        noAiPlatformTitle: 'Chưa bật nền tảng AI nào',
        noAiPlatformBody: 'Vào Vị trí mục tiêu để bật Gemini/OpenAI trước khi chạy theo dõi lần đầu.',
        goToTargetPosition: 'Đến Vị trí mục tiêu',
        noDataYetTitle: 'Chưa có dữ liệu — chạy theo dõi lần đầu',
        readyWithPrompts: 'Dự án đã sẵn sàng với {{prompts}} câu hỏi và {{platforms}} nền tảng AI.',
        runTrackingNow: 'Chạy theo dõi ngay',
        noPromptsYetInline: 'Chưa có câu hỏi nào.',
        createPromptSetFirst: 'Tạo bộ câu hỏi đầu tiên',
        runningTracking: 'Đang chạy theo dõi... {{done}}/{{total}} hoàn thành',
        failedSuffix: ' ({{n}} thất bại)',
        lastRunFailed: 'Lượt chạy gần nhất đã thất bại hoàn toàn — hãy thử lại.',
        couldNotLoadOverview: 'Không thể tải dữ liệu tổng quan.',
        everyPromptMetError: 'Mọi câu hỏi đã đạt mục tiêu — không có gì để chạy lại.',
        couldNotStartRun: 'Không thể bắt đầu lượt chạy.',
      },
      prompts: {
        title: 'Xếp hạng & Câu hỏi',
        subtitle: 'Mọi câu hỏi được theo dõi và thứ hạng hiển thị của từng câu.',
        couldNotLoadList: 'Không thể tải danh sách câu hỏi.',
        generateTitle: 'Tạo câu hỏi bằng AI',
        generateDesc: 'Dựa trên ngành "{{industry}}", thương hiệu "{{brand}}" và các đối thủ đã cấu hình — tạo ra 7 câu hỏi cho mục đích được chọn bên dưới.',
        unspecified: 'chưa xác định',
        trendingTopicsLabel: 'Chủ đề xu hướng ngành (tùy chọn — giúp câu hỏi bám sát xu hướng)',
        trendingWeek: 'Xu hướng tuần này',
        trendingMonth: 'Xu hướng tháng này',
        topicsSelected: 'Đã chọn {{n}} chủ đề',
        intentLabel: 'Mục đích',
        generating: 'Đang tạo...',
        generate7: 'Tạo 7 câu hỏi',
        promptSetName: 'Tên bộ câu hỏi',
        adding: 'Đang thêm...',
        addSelected: 'Thêm {{n}} câu đã chọn',
        couldNotGenerate: 'Không thể tạo câu hỏi.',
        couldNotLoadTrending: 'Không thể tải chủ đề xu hướng.',
        addManualTitle: 'Thêm câu hỏi thủ công',
        addManualDesc: 'Tự viết một câu hỏi cụ thể thay vì để AI tạo.',
        promptSetNamePlaceholder: 'ví dụ: Khám phá — Acme',
        promptTextLabel: 'Nội dung câu hỏi',
        promptTextPlaceholder: 'Ứng dụng nào an toàn nhất để chuyển tiền?',
        creating: 'Đang tạo...',
        addPrompt: '+ Thêm câu hỏi',
        couldNotAddPrompts: 'Không thể thêm câu hỏi.',
        addedPromptsTo: 'Đã thêm {{n}} câu hỏi vào "{{name}}".',
        couldNotCreatePrompt: 'Không thể tạo câu hỏi.',
        addedPromptTo: 'Đã thêm câu hỏi vào "{{name}}".',
        allPrompts: 'Tất cả câu hỏi',
        deleteSelected: 'Xóa mục đã chọn ({{n}})',
        noPromptsMatch: 'Không có câu hỏi nào khớp với bộ lọc này.',
        noPromptsYetTitle: 'Chưa có câu hỏi nào',
        noPromptsYetBody: 'Dùng biểu mẫu bên trên để thêm câu hỏi đầu tiên.',
        couldNotUpdatePrompt: 'Không thể cập nhật câu hỏi.',
        promptUpdated: 'Đã cập nhật câu hỏi.',
        deleteConfirmTitle: 'Xóa {{n}} câu hỏi?',
        deleteCannotUndo: 'Hành động này không thể hoàn tác.',
        andMore: 'và {{n}} câu khác...',
        deleteButton: 'Xóa {{n}} câu hỏi',
        deletedCount: 'Đã xóa {{n}} câu hỏi.',
        failedDeleteCount: 'Không thể xóa {{n}} câu hỏi.',
        intentLabels: { Discovery: 'Khám phá', Comparison: 'So sánh', Branded: 'Thương hiệu', 'Long-tail': 'Đuôi dài' },
      },
      sentiment: {
        subtitle: 'Cách câu trả lời của AI nói về thương hiệu, được một LLM chấm điểm như giám khảo.',
        overviewTitle: 'Tổng quan cảm xúc',
        overviewSub: 'Trên mọi lượt chạy đã ghi nhận, tất cả nền tảng',
        positiveLabel: 'Tích cực',
        neutralLabel: 'Trung lập',
        negativeLabel: 'Tiêu cực',
        notApplicableLabel: 'Không áp dụng',
        noRunsRecorded: 'Chưa có lượt chạy nào được ghi nhận.',
        byPlatformTitle: 'Theo nền tảng',
        byPlatformSub: 'Tỷ lệ cảm xúc theo từng công cụ AI',
        byIntentTitle: 'Theo mục đích',
        byIntentSub: 'Tỷ lệ cảm xúc theo mục đích câu hỏi',
        positiveTrendTitle: 'Xu hướng tỷ lệ tích cực',
        positiveTrendSub: 'Tỷ lệ lượt chạy tích cực mỗi ngày',
        topTopicsTitle: 'Chủ đề nổi bật',
        topTopicsSub: 'Các chủ đề xuất hiện nhiều nhất mà giám khảo trích xuất',
        noTopicsExtracted: 'Chưa có chủ đề nào được trích xuất.',
        recentRuns: 'Lượt chạy gần đây',
        allPlatforms: 'Tất cả nền tảng',
        thPrompt: 'Câu hỏi',
        thPlatform: 'Nền tảng',
        thSentiment: 'Cảm xúc',
        thReasoning: 'Lý giải',
        thTime: 'Thời gian',
        noRunsYetTitle: 'Chưa có lượt chạy nào',
        noRunsYetAllBody: 'Chạy theo dõi từ trang Tổng quan để bắt đầu ghi nhận cảm xúc.',
        noRunsYetFilteredBody: 'Chưa có lượt chạy nào được ghi nhận trên {{platform}}.',
        couldNotLoadSentiment: 'Không thể tải dữ liệu cảm xúc.',
        couldNotLoadRunList: 'Không thể tải danh sách lượt chạy.',
        todayPositive: 'Hôm nay · {{pct}}% tích cực',
      },
      gapCitation: {
        subtitlePre: 'Kiểm tra kỹ thuật GEO của website — mức độ sẵn sàng để các trình thu thập dữ liệu AI thu thập và trích dẫn (chấm điểm bởi ',
        subtitleLink: 'geo-optimizer-skill',
        subtitlePost: ').',
        noWebsiteTitle: 'Dự án này chưa thiết lập website',
        noWebsiteBody: 'Thiết lập "Website chính thức" ở Vị trí mục tiêu để chạy kiểm tra GEO.',
        noAuditYetTitle: 'Chưa có lượt kiểm tra nào',
        runFirstAudit: 'Chạy lượt kiểm tra đầu tiên cho {{domain}}.',
        runAuditNow: 'Chạy kiểm tra ngay',
        runAuditAgain: 'Chạy kiểm tra lại',
        geoScoreTitle: 'Điểm GEO',
        auditedAt: 'Đã kiểm tra {{date}}',
        breakdownTitle: 'Chi tiết theo hạng mục',
        breakdownSub: '8 hạng mục được chấm điểm bởi geo-optimizer-skill',
        recommendationsTitle: 'Đề xuất cải thiện',
        noRecommendations: 'Không có đề xuất nào — mọi hạng mục đều đạt.',
        auditingDomain: 'Đang kiểm tra {{domain}} — việc tải trang trực tiếp có thể mất 10-60 giây...',
        auditFailed: 'Kiểm tra thất bại: {{message}}',
        couldNotLoadAudit: 'Không thể tải kết quả kiểm tra.',
        couldNotStartAudit: 'Không thể bắt đầu kiểm tra.',
        skillModalTitle: 'geo-optimizer-skill',
        skillModalDesc: 'Công cụ kiểm tra của bên thứ ba mà GeoBase sử dụng trên trang này.',
        checkLabels: {
          robots_txt: 'Robots.txt',
          llms_txt: 'llms.txt',
          schema_jsonld: 'Schema JSON-LD',
          meta_tags: 'Thẻ meta',
          content: 'Nội dung',
          signals: 'Tín hiệu trang',
          ai_discovery: 'Khả năng được AI phát hiện',
          brand_entity: 'Thực thể thương hiệu',
        },
        bandLabels: { excellent: 'Xuất sắc', good: 'Tốt', foundation: 'Nền tảng', critical: 'Nghiêm trọng' },
      },
      target: {
        subtitle: 'Chọn nền tảng AI cần theo dõi, mục tiêu Điểm hiển thị và số lần chạy mỗi câu hỏi.',
        platformsTitle: 'Nền tảng AI được theo dõi',
        platformsSub: 'Câu hỏi sẽ được gửi đến các nền tảng đã chọn mỗi khi chạy theo dõi.',
        geminiNote: 'Grounding với Google Search: bật',
        openaiNote: 'Không có trích dẫn trừ khi công cụ tìm kiếm web được bật',
        targetFrequencyTitle: 'Mục tiêu & tần suất',
        targetScoreLabel: 'Điểm hiển thị mục tiêu (0-100)',
        runsPerPromptLabel: 'Số lần chạy mỗi câu hỏi (giảm nhiễu do LLM không ổn định)',
        competitorsLabel: 'Đối thủ được theo dõi (phân tách bằng dấu phẩy)',
        competitorsPlaceholder: 'Đối thủ A, Đối thủ B',
        websiteLabel: 'Website chính thức',
        websitePlaceholder: 'example.com',
        websiteHint: 'Dùng để chạy kiểm tra GEO ở trang Gap & Citation.',
        saveConfig: 'Lưu cấu hình',
        couldNotSaveConfig: 'Không thể lưu cấu hình.',
        configSaved: 'Đã lưu cấu hình.',
      },
      aiAgent: {
        subtitle: 'Tác vụ tự động: chạy lại theo dõi theo lịch, cảnh báo khi tụt hạng, gợi ý câu hỏi mới.',
        comingSoonBody: 'Tính năng tự động hóa chưa được xây dựng — hiện tại các lượt chạy theo dõi được kích hoạt thủ công từ trang Tổng quan.',
      },
      amplify: {
        subtitle: 'Đề xuất hành động để cải thiện Điểm hiển thị cho các câu hỏi chưa đạt mục tiêu.',
        comingSoonBody: 'Các đề xuất khuếch đại nội dung và PR chưa được xây dựng.',
      },
    },
    checkout: {
      backToPricing: '← Quay lại bảng giá',
      eyebrow: 'Thanh toán',
      planLabel: 'Gói đã chọn',
      priceLabel: 'Số tiền',
      qrTitle: 'Mã QR thanh toán',
      qrPlaceholder: 'Chúng tôi đang hoàn tất mã QR thanh toán cho gói này.',
      instructions: 'Đội ngũ Kompa sẽ gửi trực tiếp mã QR và thông tin chuyển khoản cho bạn, sau đó kích hoạt gói ngay khi xác nhận đã thanh toán.',
      contactCta: 'Liên hệ để hoàn tất thanh toán',
      notFoundTitle: 'Không tìm thấy gói',
      notFoundBody: 'Không tìm thấy gói này. Vui lòng chọn gói từ trang bảng giá.',
      backHome: 'Về trang bảng giá',
    },
    reportCheckout: {
      backToReports: '← Quay lại báo cáo',
      steps: ['Thông tin', 'Thanh toán', 'Tải về'],
      orderLabel: 'Đơn hàng',
      vatLabel: 'VAT (10%)',
      totalLabel: 'Tổng',
      emailLabel: 'Email nhận file *',
      emailPlaceholder: 'a.nguyen@brand.vn',
      companyLabel: 'Tên công ty + MST (để xuất hoá đơn — không bắt buộc)',
      discountLabel: 'Mã giảm giá',
      licenseLabel: 'Đồng ý điều khoản giấy phép 1 tổ chức',
      continueCta: 'Tiếp tục',
      submitting: 'Đang gửi...',
      genericError: 'Không thể tạo đơn hàng. Vui lòng thử lại.',
      paymentMethods: ['VietQR', 'MoMo', 'Thẻ quốc tế'],
      qrScanHint: 'Quét bằng app ngân hàng bất kỳ',
      qrWebhookHint: 'Tự xác nhận qua webhook — không cần bấm gì thêm',
      simulatePayCta: '— Mô phỏng: đã thanh toán →',
      payingCta: 'Đang xác nhận...',
      downloadTitle: 'Thanh toán thành công',
      downloadBody: 'Báo cáo của bạn đã sẵn sàng. Một bản sao cũng đã được gửi qua email.',
      downloadCta: 'Tải xuống báo cáo',
      notFoundTitle: 'Không tìm thấy báo cáo',
      notFoundBody: 'Không tìm thấy báo cáo này. Vui lòng chọn một báo cáo từ mục Báo cáo.',
      backHome: 'Về trang báo cáo',
    },
  },
};

const LanguageContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Translations } | null>(null);

const STORAGE_KEY = 'geobase-lang';
const GEO_LANG_COOKIE = 'geobase-geo-lang';

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Language priority: an explicit toggle choice (localStorage) always wins;
// otherwise fall back to the IP-based country detection set by
// middleware.ts (Vietnam -> vi, everywhere else -> en); otherwise default to
// Vietnamese, since trending prompt sets are a Vietnam-market-only feature.
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'vi') {
      setLangState(stored);
      return;
    }
    const detected = readCookie(GEO_LANG_COOKIE);
    if (detected === 'en' || detected === 'vi') {
      setLangState(detected);
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }

  const value = useMemo(() => ({ lang, setLang, t: translations[lang] }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
