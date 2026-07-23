'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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

export default function ReportsSection() {
  const { t } = useLanguage();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [category, setCategory] = useState<ReportCategory | 'all'>('all');
  const [selected, setSelected] = useState<Report | null>(null);

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

  function closeModal() {
    setSelected(null);
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
              <button className="gb-mkt-report-card" key={report._id} onClick={() => setSelected(report)}>
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
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="gb-badge warn">
                    {t.reports.priceLabel}: {formatVnd(selected.priceVnd)}
                  </span>
                  <Link href={`/checkout/report/${selected._id}`} className="gb-btn gb-btn-primary">
                    {t.reports.buyCta}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
