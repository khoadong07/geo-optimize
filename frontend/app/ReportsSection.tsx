'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLanguage } from './i18n';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ReportCategory = 'banking' | 'fmcg' | 'insurance' | 'telecom' | 'real_estate' | 'general';
type ReportStatus = 'published' | 'coming_soon';

type Report = {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  category: ReportCategory;
  priceVnd: number;
  status: ReportStatus;
  coverImagePath: string;
  createdAt: string;
};

const CATEGORY_ORDER: ReportCategory[] = ['banking', 'fmcg', 'insurance', 'telecom', 'real_estate', 'general'];

function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

function ReportCover({ report }: { report: Report }) {
  if (report.coverImagePath) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/uploads/covers/${report.coverImagePath}`} alt="" className="gb-mkt-report-cover-img" />;
  }
  return <div className="gb-mkt-report-cover-placeholder">Cover</div>;
}

function BuyForm({ report, onDone }: { report: Report; onDone: () => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch(`${API}/report-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: report._id, name, email, company: company || undefined }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(Array.isArray(data.message) ? data.message[0] : data.message || t.reports.buyForm.genericError);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="gb-banner info" style={{ marginTop: 16 }}>
        <b>{t.reports.buyForm.successTitle}</b>
        <div style={{ marginTop: 4 }}>{t.reports.buyForm.successBody.split('{{email}}').join(email)}</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
      <label className="gb-label">
        {t.reports.buyForm.name}
        <input className="gb-input" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="gb-label">
        {t.reports.buyForm.email}
        <input type="email" className="gb-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="gb-label">
        {t.reports.buyForm.company}
        <input className="gb-input" value={company} onChange={(e) => setCompany(e.target.value)} />
      </label>
      {error ? <div className="gb-banner error">{error}</div> : null}
      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" className="gb-btn gb-btn-ghost" onClick={onDone}>
          {t.app.common.cancel}
        </button>
        <button className="gb-btn gb-btn-primary" type="submit" disabled={submitting}>
          {submitting ? t.reports.buyForm.submitting : t.reports.buyForm.submit}
        </button>
      </div>
    </form>
  );
}

export default function ReportsSection() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [category, setCategory] = useState<ReportCategory | 'all'>('all');
  const [selected, setSelected] = useState<Report | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetch(`${API}/reports`)
      .then((res) => res.json())
      .then(setReports)
      .catch(() => setReports([]));
  }, []);

  const filtered = useMemo(() => {
    if (!reports) return [];
    return category === 'all' ? reports : reports.filter((r) => r.category === category);
  }, [reports, category]);

  function openReport(report: Report) {
    setSelected(report);
    setBuying(false);
  }

  function closeModal() {
    setSelected(null);
    setBuying(false);
  }

  return (
    <section className="gb-mkt-section" id="reports">
      <div className="gb-mkt-wrap">
        <div className="gb-mkt-section-head">
          <p className="gb-mkt-eyebrow">{t.reports.eyebrow}</p>
          <h2>{t.reports.h2}</h2>
          <p>{t.reports.lede}</p>
        </div>

        <div className="gb-mkt-reports-toolbar">
          <div className="gb-mkt-reports-filters">
            <button className={`gb-btn gb-btn-ghost gb-chip${category === 'all' ? ' active' : ''}`} onClick={() => setCategory('all')}>
              {t.reports.filterAll}
            </button>
            {CATEGORY_ORDER.map((c) => (
              <button key={c} className={`gb-btn gb-btn-ghost gb-chip${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>
                {t.reports.categories[c]}
              </button>
            ))}
          </div>
          <label className="gb-mkt-reports-sort">
            {t.reports.sortLabel}:
            <select className="gb-input" defaultValue="newest">
              <option value="newest">{t.reports.sortNewest}</option>
            </select>
          </label>
        </div>

        {reports === null ? (
          <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t.app.common.loading}</p>
        ) : filtered.length ? (
          <div className="gb-mkt-reports-grid">
            {filtered.map((report) => (
              <button className="gb-mkt-report-card" key={report._id} onClick={() => openReport(report)}>
                <ReportCover report={report} />
                <div className="gb-mkt-report-body">
                  {report.status === 'coming_soon' ? (
                    <span className="gb-badge neutral">{t.reports.comingSoon}</span>
                  ) : report.priceVnd === 0 ? (
                    <span className="gb-badge ok">{t.reports.free}</span>
                  ) : (
                    <span className="gb-badge warn">{formatVnd(report.priceVnd)}</span>
                  )}
                  <h3 className="gb-mkt-report-title">{report.title}</h3>
                  {report.subtitle ? <p className="gb-mkt-report-meta">{report.subtitle}</p> : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="gb-card gb-empty">
            <strong>{t.reports.emptyTitle}</strong>
            {t.reports.emptyBody}
          </div>
        )}
      </div>

      {selected ? (
        <div className="gb-modal-overlay" onClick={closeModal}>
          <div className="gb-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>{selected.title}</h3>
                {selected.subtitle ? <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>{selected.subtitle}</p> : null}
              </div>
              <button className="gb-modal-close" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>
            <div className="gb-modal-body">
              <ReportCover report={selected} />
              <p style={{ marginTop: 16 }}>{selected.description || selected.subtitle}</p>

              {selected.status === 'coming_soon' ? (
                <span className="gb-badge neutral">{t.reports.comingSoon}</span>
              ) : selected.priceVnd === 0 ? (
                <a className="gb-btn gb-btn-primary" href={`${API}/reports/${selected._id}/download`}>
                  {t.reports.downloadCta}
                </a>
              ) : buying ? (
                <BuyForm report={selected} onDone={() => setBuying(false)} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="gb-badge warn">
                    {t.reports.priceLabel}: {formatVnd(selected.priceVnd)}
                  </span>
                  <button className="gb-btn gb-btn-primary" onClick={() => setBuying(true)}>
                    {t.reports.buyCta}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
