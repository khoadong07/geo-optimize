'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useLanguage } from '../../i18n';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Order = {
  _id: string;
  orderNumber: number;
  planName: string;
  priceVnd: number;
  vatVnd: number;
  totalVnd: number;
  email: string;
};

function formatVnd(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + '₫';
}

export default function CheckoutPage() {
  const { lang, setLang, t } = useLanguage();
  const params = useParams<{ plan: string }>();
  const plan = t.pricing.plans.find((p) => p.slug === params.plan && p.slug !== 'enterprise');

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [order, setOrder] = useState<Order | null>(null);

  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [method, setMethod] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (step !== 2 || !order) return;
    QRCode.toDataURL(`geobase:order:${order.orderNumber}:amount:${order.totalVnd}`, { margin: 1, width: 240 }).then(setQrDataUrl);
  }, [step, order]);

  async function handleCreateOrder(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch(`${API}/plan-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planSlug: params.plan,
        email,
        company: company || undefined,
        discountCode: discountCode || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(Array.isArray(data.message) ? data.message[0] : data.message || t.checkout.genericError);
      return;
    }
    const created: Order = await res.json();
    setOrder(created);
    setStep(2);
  }

  async function handleSimulatePay() {
    if (!order) return;
    setPaying(true);
    await fetch(`${API}/plan-orders/${order._id}/simulate-payment`, { method: 'POST' }).catch(() => {});
    setPaying(false);
    setStep(3);
  }

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
        <div className="gb-mkt-wrap" style={{ maxWidth: 980 }}>
          <Link href="/#pricing" className="gb-mkt-checkout-back">
            {t.checkout.backToPricing}
          </Link>

          {!plan ? (
            <div className="gb-mkt-price" style={{ marginTop: 20, maxWidth: 520 }}>
              <h2 style={{ margin: '0 0 8px' }}>{t.checkout.notFoundTitle}</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 20 }}>{t.checkout.notFoundBody}</p>
              <Link href="/#pricing" className="gb-btn gb-btn-primary" style={{ textAlign: 'center' }}>
                {t.checkout.backHome}
              </Link>
            </div>
          ) : (
            <>
              <div className="gb-checkout-steps" style={{ marginTop: 20 }}>
                {t.checkout.steps.map((label, i) => (
                  <div key={label} className={`gb-checkout-step${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
                    {i + 1} · {label}
                  </div>
                ))}
              </div>

              <div className="gb-checkout-grid">
                <div className="gb-mkt-price">
                  <div className="gb-mkt-price-name">
                    {t.checkout.orderLabel} {order ? `#${order.orderNumber}` : ''}
                  </div>

                  <div className="gb-checkout-order-row">
                    <span>
                      {t.checkout.planLabel}: {plan.name}
                      {plan.period ? plan.period : ''}
                    </span>
                    <b>{order ? formatVnd(order.priceVnd) : plan.price}</b>
                  </div>
                  <div className="gb-checkout-order-row">
                    <span>{t.checkout.vatLabel}</span>
                    <span>{order ? formatVnd(order.vatVnd) : '—'}</span>
                  </div>
                  <div className="gb-checkout-order-row total">
                    <span>{t.checkout.totalLabel}</span>
                    <span>{order ? formatVnd(order.totalVnd) : '—'}</span>
                  </div>

                  {step === 1 ? (
                    <form onSubmit={handleCreateOrder} style={{ marginTop: 18, display: 'grid', gap: 14 }}>
                      <label className="gb-label">
                        {t.checkout.emailLabel}
                        <input
                          type="email"
                          className="gb-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.checkout.emailPlaceholder}
                          required
                        />
                      </label>
                      <label className="gb-label">
                        {t.checkout.companyLabel}
                        <input className="gb-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="—" />
                      </label>
                      <label className="gb-label">
                        {t.checkout.discountLabel}
                        <input className="gb-input" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="—" />
                      </label>
                      {error ? <div className="gb-banner error">{error}</div> : null}
                      <button className="gb-btn gb-btn-primary" type="submit" disabled={submitting}>
                        {submitting ? t.checkout.submitting : t.checkout.continueCta}
                      </button>
                    </form>
                  ) : null}
                </div>

                {step >= 2 ? (
                  <div className="gb-mkt-price">
                    <div className="gb-checkout-methods">
                      {t.checkout.paymentMethods.map((m, i) => (
                        <button key={m} type="button" className={`gb-checkout-method${method === i ? ' active' : ''}`} onClick={() => setMethod(i)}>
                          {m}
                        </button>
                      ))}
                    </div>

                    {step === 2 ? (
                      <>
                        <div className="gb-checkout-qr-box">
                          {qrDataUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={qrDataUrl} alt="QR" />
                          ) : null}
                        </div>
                        <p className="gb-checkout-hint">
                          {t.checkout.qrScanHint}
                          <br />
                          {t.checkout.qrWebhookHint}
                        </p>
                        <button className="gb-btn gb-btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleSimulatePay} disabled={paying}>
                          {paying ? t.checkout.payingCta : t.checkout.simulatePayCta}
                        </button>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ color: 'var(--green)', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{t.checkout.doneTitle}</div>
                        <p style={{ color: 'var(--text-dim)', fontSize: 13.5 }}>{t.checkout.doneBody}</p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
