'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import DemoAnimation from './DemoAnimation';
import { useLanguage } from './i18n';
import { IconAmplify, IconAudit, IconContentAgent, IconPlatforms, IconPrompts, IconSentiment, IconTrending, IconVisibility } from './icons';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const FEATURE_ICONS = [IconVisibility, IconSentiment, IconPlatforms, IconPrompts, IconTrending, IconAudit];
const ROADMAP_ICONS = [IconAmplify, IconContentAgent];

export default function MarketingLandingPage() {
  const { lang, setLang, t } = useLanguage();
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
      setError(Array.isArray(data.message) ? data.message[0] : data.message || t.trial.genericError);
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
            <a href="#product">{t.nav.product}</a>
            <a href="#pricing">{t.nav.pricing}</a>
            <a href="#trial">{t.nav.trial}</a>
          </div>
          <div className="gb-mkt-nav-actions">
            <div className="gb-lang-switch" role="group" aria-label="Language">
              <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
              <button type="button" className={lang === 'vi' ? 'active' : ''} onClick={() => setLang('vi')}>
                VI
              </button>
            </div>
            <Link href="/login" className="gb-btn gb-btn-ghost">
              {t.nav.signIn}
            </Link>
            <a href="#trial" className="gb-btn gb-btn-primary">
              {t.nav.startTrial}
            </a>
          </div>
        </div>
      </nav>

      <header className="gb-mkt-hero">
        <div className="gb-mkt-wrap gb-mkt-hero-grid">
          <div>
            <p className="gb-mkt-eyebrow">{t.hero.eyebrow}</p>
            <h1 className="gb-mkt-h1">
              {t.hero.h1Pre}
              <em>{t.hero.h1Em}</em>
              {t.hero.h1Post}
            </h1>
            <p className="gb-mkt-lede">{t.hero.lede}</p>
            <div className="gb-mkt-cta-row">
              <a href="#trial" className="gb-btn gb-btn-primary">
                {t.hero.startTrial}
              </a>
              <Link href="/login" className="gb-btn gb-btn-ghost">
                {t.hero.signIn}
              </Link>
            </div>
            <div className="gb-mkt-trust-row">
              {t.hero.trustPills.map((pill) => (
                <span className="gb-mkt-trust-pill" key={pill}>
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <DemoAnimation />
        </div>
      </header>

      <section className="gb-mkt-section tight" id="product">
        <div className="gb-mkt-wrap">
          <div className="gb-mkt-section-head">
            <p className="gb-mkt-eyebrow">{t.steps.eyebrow}</p>
            <h2>{t.steps.h2}</h2>
            <p>{t.steps.lede}</p>
          </div>
          <div className="gb-mkt-steps">
            {t.steps.items.map((step, i) => (
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
            <p className="gb-mkt-eyebrow">{t.features.eyebrow}</p>
            <h2>{t.features.h2}</h2>
            <p>{t.features.lede}</p>
          </div>
          <div className="gb-mkt-features">
            {t.features.items.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div className="gb-mkt-feature" key={f.title}>
                  <div className="gb-mkt-feature-icon">
                    <Icon />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="gb-mkt-section tight" id="roadmap">
        <div className="gb-mkt-wrap">
          <div className="gb-mkt-section-head">
            <p className="gb-mkt-eyebrow">{t.roadmap.eyebrow}</p>
            <h2>{t.roadmap.h2}</h2>
            <p>{t.roadmap.lede}</p>
          </div>
          <div className="gb-mkt-features" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 780, margin: '0 auto' }}>
            {t.roadmap.items.map((r, i) => {
              const Icon = ROADMAP_ICONS[i];
              return (
                <div className="gb-mkt-feature" key={r.title}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div className="gb-mkt-feature-icon" style={{ marginBottom: 0 }}>
                      <Icon />
                    </div>
                    <span className="gb-badge warn">{t.roadmap.comingSoon}</span>
                  </div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="gb-mkt-section" id="pricing">
        <div className="gb-mkt-wrap">
          <div className="gb-mkt-section-head">
            <p className="gb-mkt-eyebrow">{t.pricing.eyebrow}</p>
            <h2>{t.pricing.h2}</h2>
            <p>{t.pricing.lede}</p>
          </div>
          <div className="gb-mkt-pricing">
            {t.pricing.plans.map((plan, i) => (
              <div className={`gb-mkt-price${i === 1 ? ' featured' : ''}`} key={plan.name}>
                {i === 1 ? <span className="gb-mkt-price-badge">{t.pricing.mostPopular}</span> : null}
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
                <a href="#trial" className={`gb-btn ${i === 1 ? 'gb-btn-primary' : 'gb-btn-ghost'}`} style={{ textAlign: 'center' }}>
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
                <h2 style={{ margin: 0 }}>{t.trial.successTitle}</h2>
                <p style={{ margin: 0 }}>
                  {t.trial.successBody
                    .split('{{name}}')
                    .join(name.split(' ')[0])
                    .split('{{email}}')
                    .join(email)}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="gb-mkt-eyebrow">{t.trial.eyebrow}</p>
                  <h2>{t.trial.h2}</h2>
                  <p>{t.trial.lede}</p>
                </div>
                <form className="gb-mkt-trial-form" onSubmit={handleSubmit}>
                  <label className="gb-label">
                    {t.trial.name}
                    <input className="gb-input" value={name} onChange={(e) => setName(e.target.value)} required />
                  </label>
                  <label className="gb-label">
                    {t.trial.email}
                    <input type="email" className="gb-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </label>
                  <label className="gb-label">
                    {t.trial.company}
                    <input className="gb-input" value={company} onChange={(e) => setCompany(e.target.value)} required />
                  </label>
                  <label className="gb-label">
                    {t.trial.message}
                    <textarea
                      className="gb-input"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.trial.messagePlaceholder}
                    />
                  </label>
                  {error ? <div className="gb-banner error">{error}</div> : null}
                  <button className="gb-btn gb-btn-primary" type="submit" disabled={submitting}>
                    {submitting ? t.trial.submitting : t.trial.submit}
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
            <a href="#product">{t.footer.product}</a>
            <a href="#pricing">{t.footer.pricing}</a>
            <Link href="/login">{t.footer.signIn}</Link>
          </div>
          <div className="gb-mkt-footer-copy">
            © {new Date().getFullYear()} GeoBase. {t.footer.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
