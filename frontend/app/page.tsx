'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import DemoAnimation from './DemoAnimation';
import { IconAmplify, IconAudit, IconContentAgent, IconPlatforms, IconPrompts, IconSentiment, IconTrending, IconVisibility } from './icons';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STEPS = [
  {
    title: 'Ask',
    body: 'We simulate the real questions your customers type into AI assistants — generated from your industry, brand, and live trending topics.',
  },
  {
    title: 'Track',
    body: 'Every response is scored for brand visibility, ranking position, and sentiment — across every AI platform you enable.',
  },
  {
    title: 'Improve',
    body: "Gap & Citation audits your website's AI-readiness and hands you a fix list, so the next answer favors you.",
  },
];

const FEATURES = [
  {
    title: 'Visibility scoring',
    body: 'Rank-based scoring shows exactly where your brand lands in every AI answer, not just whether it was mentioned.',
    icon: IconVisibility,
  },
  {
    title: 'Sentiment analysis',
    body: 'An LLM-as-judge reads every response and grades tone — positive, neutral, or negative — with its reasoning.',
    icon: IconSentiment,
  },
  {
    title: 'Multi-platform tracking',
    body: 'Gemini and OpenAI today, with more AI answer engines on the roadmap.',
    icon: IconPlatforms,
  },
  {
    title: 'AI-assisted prompts',
    body: 'Generate on-brand, on-trend questions in one click, tuned to your industry and competitors.',
    icon: IconPrompts,
  },
  {
    title: 'Trending topics',
    body: 'Pull real weekly and monthly industry trends straight into your prompt generation, so tracking stays current.',
    icon: IconTrending,
  },
  {
    title: 'GEO site audit',
    body: 'A technical readiness score for your site — schema markup, llms.txt, robots.txt, and more.',
    icon: IconAudit,
  },
];

const ROADMAP = [
  {
    title: 'Amplify',
    body: "Turns tracking data into a prioritized action list — see exactly which prompts are missing their visibility target, and what to publish, update, or pitch next to close the gap.",
    icon: IconAmplify,
  },
  {
    title: 'AI Content Agent',
    body: 'An agent that drafts the actual content built to amplify your visibility — articles, FAQ pages, and PR angles written to answer the exact questions AI engines are asked.',
    icon: IconContentAgent,
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    desc: 'For a single brand getting started with GEO.',
    features: ['1 project', '1 AI platform', '20 tracked prompts / month', 'Sentiment analysis', 'Email support'],
    cta: 'Start free trial',
    featured: false,
  },
  {
    name: 'Growth',
    price: '$199',
    period: '/month',
    desc: 'For teams actively managing brand visibility.',
    features: [
      '5 projects',
      'Gemini + OpenAI tracking',
      'Unlimited tracked prompts',
      'AI-assisted prompt generation',
      'Trending topics',
      'GEO site audits',
      'Priority support',
    ],
    cta: 'Start free trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For organizations with multiple brands or agencies.',
    features: ['Unlimited projects', 'Custom AI platforms', 'Dedicated onboarding', 'SLA & priority support', 'Custom integrations'],
    cta: 'Contact sales',
    featured: false,
  },
];

export default function MarketingLandingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch(`${API}/trial-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, company, message: message || undefined }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(Array.isArray(data.message) ? data.message[0] : data.message || 'Could not submit your request. Please try again.');
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="gb-mkt">
      <nav className="gb-mkt-nav">
        <div className="gb-mkt-wrap gb-mkt-nav-row">
          <div className="gb-mkt-logo">
            <span className="gb-live-dot pulse" aria-hidden="true" />
            GeoBase
          </div>
          <div className="gb-mkt-nav-links">
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#trial">Trial</a>
          </div>
          <div className="gb-mkt-nav-actions">
            <Link href="/login" className="gb-btn gb-btn-ghost">
              Sign in
            </Link>
            <a href="#trial" className="gb-btn gb-btn-primary">
              Start free trial
            </a>
          </div>
        </div>
      </nav>

      <header className="gb-mkt-hero">
        <div className="gb-mkt-wrap gb-mkt-hero-grid">
          <div>
            <p className="gb-mkt-eyebrow">GEO · Generative Engine Optimization</p>
            <h1 className="gb-mkt-h1">
              Know if AI <em>recommends</em> your brand.
            </h1>
            <p className="gb-mkt-lede">
              GeoBase tracks how often, where, and how positively AI answer engines like Gemini and ChatGPT mention your brand — so you can act
              before competitors do.
            </p>
            <div className="gb-mkt-cta-row">
              <a href="#trial" className="gb-btn gb-btn-primary">
                Start free trial
              </a>
              <Link href="/login" className="gb-btn gb-btn-ghost">
                Sign in
              </Link>
            </div>
            <div className="gb-mkt-trust-row">
              <span className="gb-mkt-trust-pill">Tracks Gemini &amp; OpenAI</span>
              <span className="gb-mkt-trust-pill">LLM-judged sentiment</span>
              <span className="gb-mkt-trust-pill">Built for the Vietnamese market</span>
            </div>
          </div>

          <DemoAnimation />
        </div>
      </header>

      <section className="gb-mkt-section tight" id="product">
        <div className="gb-mkt-wrap">
          <div className="gb-mkt-section-head">
            <p className="gb-mkt-eyebrow">How it works</p>
            <h2>From question to fix, in three steps</h2>
            <p>GeoBase runs the same loop your customers do — ask an AI assistant, see what it says, then close the gap.</p>
          </div>
          <div className="gb-mkt-steps">
            {STEPS.map((step, i) => (
              <div className="gb-mkt-step" key={step.title}>
                <div className="gb-mkt-step-num">0{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gb-mkt-section">
        <div className="gb-mkt-wrap">
          <div className="gb-mkt-section-head">
            <p className="gb-mkt-eyebrow">Everything you need</p>
            <h2>Built around how AI answer engines actually work</h2>
            <p>Every metric below comes from real tracked runs against live AI platforms — not estimates.</p>
          </div>
          <div className="gb-mkt-features">
            {FEATURES.map((f) => (
              <div className="gb-mkt-feature" key={f.title}>
                <div className="gb-mkt-feature-icon">
                  <f.icon />
                </div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gb-mkt-section tight" id="roadmap">
        <div className="gb-mkt-wrap">
          <div className="gb-mkt-section-head">
            <p className="gb-mkt-eyebrow">Coming next</p>
            <h2>From insight to action</h2>
            <p>Two upcoming modules that turn what GeoBase learns into real content and distribution.</p>
          </div>
          <div className="gb-mkt-features" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 780, margin: '0 auto' }}>
            {ROADMAP.map((r) => (
              <div className="gb-mkt-feature" key={r.title}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div className="gb-mkt-feature-icon" style={{ marginBottom: 0 }}>
                    <r.icon />
                  </div>
                  <span className="gb-badge warn">Coming soon</span>
                </div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gb-mkt-section" id="pricing">
        <div className="gb-mkt-wrap">
          <div className="gb-mkt-section-head">
            <p className="gb-mkt-eyebrow">Pricing</p>
            <h2>Simple plans that scale with your brand</h2>
            <p>Every plan starts with a free trial. No credit card required.</p>
          </div>
          <div className="gb-mkt-pricing">
            {PLANS.map((plan) => (
              <div className={`gb-mkt-price${plan.featured ? ' featured' : ''}`} key={plan.name}>
                {plan.featured ? <span className="gb-mkt-price-badge">Most popular</span> : null}
                <div className="gb-mkt-price-name">{plan.name}</div>
                <div className="gb-mkt-price-desc">{plan.desc}</div>
                <div className="gb-mkt-price-amount">
                  {plan.price}
                  {plan.period ? <span>{plan.period}</span> : null}
                </div>
                <ul className="gb-mkt-price-list">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <a href="#trial" className={`gb-btn ${plan.featured ? 'gb-btn-primary' : 'gb-btn-ghost'}`} style={{ textAlign: 'center' }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gb-mkt-section" id="trial">
        <div className="gb-mkt-wrap">
          <div className="gb-mkt-trial">
            {submitted ? (
              <div className="gb-mkt-success" style={{ gridColumn: '1 / -1' }}>
                <div className="gb-mkt-success-icon">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5 6.2 12 13 4" />
                  </svg>
                </div>
                <h2 style={{ margin: 0 }}>Your account is on its way</h2>
                <p style={{ margin: 0 }}>
                  Thanks, {name.split(' ')[0]} — we&apos;ve created your trial account and sent sign-in details to{' '}
                  <b style={{ color: 'var(--text)' }}>{email}</b>. Check your inbox in the next few minutes.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="gb-mkt-eyebrow">Free trial</p>
                  <h2>Start tracking your brand&apos;s AI visibility</h2>
                  <p>
                    Tell us about your brand — we&apos;ll create your account instantly and email you sign-in access. No credit card required,
                    cancel anytime.
                  </p>
                </div>
                <form className="gb-mkt-trial-form" onSubmit={handleSubmit}>
                  <label className="gb-label">
                    Full name
                    <input className="gb-input" value={name} onChange={(e) => setName(e.target.value)} required />
                  </label>
                  <label className="gb-label">
                    Work email
                    <input type="email" className="gb-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </label>
                  <label className="gb-label">
                    Company
                    <input className="gb-input" value={company} onChange={(e) => setCompany(e.target.value)} required />
                  </label>
                  <label className="gb-label">
                    Message (optional)
                    <textarea
                      className="gb-input"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Which brand and industry would you like to track?"
                    />
                  </label>
                  {error ? <div className="gb-banner error">{error}</div> : null}
                  <button className="gb-btn gb-btn-primary" type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Request access'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="gb-mkt-footer">
        <div className="gb-mkt-wrap gb-mkt-footer-inner">
          <div className="gb-mkt-logo">
            <span className="gb-live-dot" aria-hidden="true" />
            GeoBase
          </div>
          <div className="gb-mkt-footer-links">
            <a href="#product">Product</a>
            <a href="#pricing">Pricing</a>
            <Link href="/login">Sign in</Link>
          </div>
          <div className="gb-mkt-footer-copy">© {new Date().getFullYear()} GeoBase. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
