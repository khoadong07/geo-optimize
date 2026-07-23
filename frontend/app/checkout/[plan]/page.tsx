'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../i18n';

export default function CheckoutPage() {
  const { lang, setLang, t } = useLanguage();
  const params = useParams<{ plan: string }>();
  const plan = t.pricing.plans.find((p) => p.slug === params.plan && p.slug !== 'enterprise');

  return (
    <div className="gb-mkt">
      <nav className="gb-mkt-nav">
        <div className="gb-mkt-wrap gb-mkt-nav-row">
          <Link href="/" className="gb-mkt-logo">
            <span className="gb-live-dot pulse" aria-hidden="true" />
            GeoBase
          </Link>
          <div className="gb-mkt-nav-actions">
            <div className="gb-lang-switch" role="group" aria-label="Language">
              <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
              <button type="button" className={lang === 'vi' ? 'active' : ''} onClick={() => setLang('vi')}>
                VI
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="gb-mkt-section">
        <div className="gb-mkt-wrap" style={{ maxWidth: 520 }}>
          <Link href="/#pricing" className="gb-mkt-checkout-back">
            {t.checkout.backToPricing}
          </Link>

          {!plan ? (
            <div className="gb-mkt-price" style={{ marginTop: 20 }}>
              <h2 style={{ margin: '0 0 8px' }}>{t.checkout.notFoundTitle}</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 20 }}>{t.checkout.notFoundBody}</p>
              <Link href="/#pricing" className="gb-btn gb-btn-primary" style={{ textAlign: 'center' }}>
                {t.checkout.backHome}
              </Link>
            </div>
          ) : (
            <div className="gb-mkt-price" style={{ marginTop: 20 }}>
              <p className="gb-mkt-eyebrow">{t.checkout.eyebrow}</p>
              <div className="gb-mkt-price-name">{t.checkout.planLabel}: {plan.name}</div>
              <div className="gb-mkt-price-amount">
                {plan.price}
                {plan.period ? <span>{plan.period}</span> : null}
              </div>

              <div className="gb-mkt-checkout-qr">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01" />
                </svg>
                <div className="gb-mkt-price-name">{t.checkout.qrTitle}</div>
                <p>{t.checkout.qrPlaceholder}</p>
              </div>

              <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.6, margin: '18px 0 24px' }}>{t.checkout.instructions}</p>

              <a href="/#trial" className="gb-btn gb-btn-primary" style={{ textAlign: 'center' }}>
                {t.checkout.contactCta}
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
