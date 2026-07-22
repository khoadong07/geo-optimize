'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { interpolate, useLanguage } from '../../../i18n';
import { API, authHeader, useProjectContext } from '../project-context';

type Breakdown = { positive: number; neutral: number; negative: number; notApplicable: number } | null;

type SentimentSplit = { positive: number; neutral: number; negative: number; notApplicable: number; total: number };

type SentimentStats = {
  totalRuns: number;
  byPlatform: (SentimentSplit & { platform: 'GEMINI' | 'OPENAI' })[];
  byIntent: (SentimentSplit & { intent: string })[];
  trend: (SentimentSplit & { date: string })[];
  topTopics: { topic: string; count: number }[];
};

type Run = {
  _id: string;
  promptText: string;
  platform: 'GEMINI' | 'OPENAI';
  sentimentLabel: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'NOT_APPLICABLE';
  sentimentReasoning: string;
  rawResponse: string;
  createdAt: string;
};

type RunsPage = { items: Run[]; total: number; page: number; limit: number };

type PlatformFilter = 'all' | 'GEMINI' | 'OPENAI';

const PLATFORM_LABEL: Record<Run['platform'], string> = { GEMINI: 'Gemini', OPENAI: 'OpenAI' };

const LABEL_CLASS: Record<Run['sentimentLabel'], string> = {
  POSITIVE: 'ok',
  NEUTRAL: 'info',
  NEGATIVE: 'bad',
  NOT_APPLICABLE: 'neutral',
};

const PAGE_SIZE = 10;

function Donut({ breakdown }: { breakdown: Breakdown }) {
  if (!breakdown) return null;
  const segs = [
    { v: breakdown.positive, color: 'var(--green)' },
    { v: breakdown.neutral, color: 'var(--blue)' },
    { v: breakdown.negative, color: 'var(--red)' },
    { v: breakdown.notApplicable, color: 'var(--text-faint)' },
  ];
  const r = 42;
  const c = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <g transform="rotate(-90 55 55)">
        {segs.map((s, i) => {
          const len = (s.v / 100) * c;
          const el = (
            <circle
              key={i}
              cx="55"
              cy="55"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-cum}
            />
          );
          cum += len;
          return el;
        })}
      </g>
    </svg>
  );
}

function StackedBar({ split }: { split: SentimentSplit }) {
  return (
    <div className="gb-track" style={{ display: 'flex' }}>
      <div style={{ width: `${split.positive}%`, background: 'var(--green)' }} />
      <div style={{ width: `${split.neutral}%`, background: 'var(--blue)' }} />
      <div style={{ width: `${split.negative}%`, background: 'var(--red)' }} />
      <div style={{ width: `${split.notApplicable}%`, background: 'var(--text-faint)' }} />
    </div>
  );
}

function PositiveRateTrend({ trend, notEnoughDataText, todayPositiveText }: { trend: SentimentStats['trend']; notEnoughDataText: string; todayPositiveText: string }) {
  if (trend.length < 2) {
    return <p style={{ fontSize: 11.5, color: 'var(--text-faint)', padding: '20px 0' }}>{notEnoughDataText}</p>;
  }
  const w = 280;
  const h = 64;
  const points = trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * w;
    const y = h - (t.positive / 100) * h;
    return `${x},${y}`;
  });
  return (
    <>
      <svg className="gb-trend-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline points={points.join(' ')} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].split(',')[0]} cy={points[points.length - 1].split(',')[1]} r="3" fill="var(--green)" />
      </svg>
      <div className="gb-trend-meta">
        <span>{trend[0].date}</span>
        <span>
          <b>{todayPositiveText}</b>
        </span>
      </div>
    </>
  );
}

export default function SentimentPage() {
  const { project } = useProjectContext();
  const { t } = useLanguage();
  const c = t.app.common;
  const s_ = t.app.sentiment;
  const [breakdown, setBreakdown] = useState<Breakdown>(null);
  const [stats, setStats] = useState<SentimentStats | null>(null);
  const [runsPage, setRunsPage] = useState<RunsPage | null>(null);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [error, setError] = useState('');
  const [previewRun, setPreviewRun] = useState<Run | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [page, setPage] = useState(1);

  const LABEL_TEXT: Record<Run['sentimentLabel'], string> = {
    POSITIVE: s_.positiveLabel,
    NEUTRAL: s_.neutralLabel,
    NEGATIVE: s_.negativeLabel,
    NOT_APPLICABLE: s_.notApplicableLabel,
  };

  const PLATFORM_FILTERS: { value: PlatformFilter; label: string }[] = [
    { value: 'all', label: s_.allPlatforms },
    { value: 'GEMINI', label: 'Gemini' },
    { value: 'OPENAI', label: 'OpenAI' },
  ];

  useEffect(() => {
    fetch(`${API}/projects/${project._id}/overview`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data) => setBreakdown(data.sentimentBreakdown))
      .catch(() => setError(s_.couldNotLoadSentiment));
    fetch(`${API}/projects/${project._id}/sentiment-stats`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data: SentimentStats) => setStats(data))
      .catch(() => setError(s_.couldNotLoadSentiment));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  useEffect(() => {
    setLoadingRuns(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (platformFilter !== 'all') params.set('platform', platformFilter);
    fetch(`${API}/projects/${project._id}/runs?${params.toString()}`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data: RunsPage) => setRunsPage(data))
      .catch(() => setError(s_.couldNotLoadRunList))
      .finally(() => setLoadingRuns(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id, platformFilter, page]);

  function handleFilterChange(f: PlatformFilter) {
    setPlatformFilter(f);
    setPage(1);
  }

  const totalPages = runsPage ? Math.max(1, Math.ceil(runsPage.total / runsPage.limit)) : 1;

  return (
    <>
      <p className="gb-eyebrow">{c.project}</p>
      <h2 className="gb-title">{t.app.layout.navSentiment}</h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        {s_.subtitle}
      </p>

      {error ? <div className="gb-banner error">{error}</div> : null}

      <div className="gb-card" style={{ marginBottom: 20 }}>
        <h2>{s_.overviewTitle}</h2>
        <p className="gb-card-sub">{s_.overviewSub}</p>
        {breakdown ? (
          <div className="gb-donut-row" style={{ marginTop: 12 }}>
            <Donut breakdown={breakdown} />
            <div className="gb-legend">
              <div className="gb-legend-item">
                <i style={{ background: 'var(--green)' }} />
                {s_.positiveLabel}
                <b>{breakdown.positive}%</b>
              </div>
              <div className="gb-legend-item">
                <i style={{ background: 'var(--blue)' }} />
                {s_.neutralLabel}
                <b>{breakdown.neutral}%</b>
              </div>
              <div className="gb-legend-item">
                <i style={{ background: 'var(--red)' }} />
                {s_.negativeLabel}
                <b>{breakdown.negative}%</b>
              </div>
              <div className="gb-legend-item">
                <i style={{ background: 'var(--text-faint)' }} />
                {s_.notApplicableLabel}
                <b>{breakdown.notApplicable}%</b>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12 }}>{s_.noRunsRecorded}</p>
        )}
      </div>

      {stats && stats.totalRuns ? (
        <>
          <div className="gb-hero-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="gb-card">
              <h2>{s_.byPlatformTitle}</h2>
              <p className="gb-card-sub">{s_.byPlatformSub}</p>
              <div style={{ marginTop: 8 }}>
                {stats.byPlatform.map((p) => (
                  <div className="gb-row" key={p.platform}>
                    <span className="gb-row-label">{PLATFORM_LABEL[p.platform]}</span>
                    <StackedBar split={p} />
                    <span className="gb-pct">{p.total}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="gb-card">
              <h2>{s_.byIntentTitle}</h2>
              <p className="gb-card-sub">{s_.byIntentSub}</p>
              <div style={{ marginTop: 8 }}>
                {stats.byIntent.map((i) => (
                  <div className="gb-row" key={i.intent}>
                    <span className="gb-row-label">
                      <span className={`gb-tag ${i.intent}`}>{i.intent}</span>
                    </span>
                    <StackedBar split={i} />
                    <span className="gb-pct">{i.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="gb-hero-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="gb-card">
              <h2>{s_.positiveTrendTitle}</h2>
              <p className="gb-card-sub">{s_.positiveTrendSub}</p>
              <PositiveRateTrend
                trend={stats.trend}
                notEnoughDataText={c.notEnoughDataTrend}
                todayPositiveText={
                  stats.trend.length ? interpolate(s_.todayPositive, { pct: stats.trend[stats.trend.length - 1].positive }) : ''
                }
              />
            </div>

            <div className="gb-card">
              <h2>{s_.topTopicsTitle}</h2>
              <p className="gb-card-sub">{s_.topTopicsSub}</p>
              {stats.topTopics.length ? (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {stats.topTopics.map((tp) => (
                    <span key={tp.topic} className="gb-pill" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      {tp.topic}
                      <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>{tp.count}</b>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12 }}>{s_.noTopicsExtracted}</p>
              )}
            </div>
          </div>
        </>
      ) : null}

      <div className="gb-section">
        {s_.recentRuns} <span className="count">{runsPage?.total ?? 0}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {PLATFORM_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`gb-btn gb-btn-ghost gb-chip${platformFilter === f.value ? ' active' : ''}`}
            onClick={() => handleFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        {loadingRuns ? (
          <div className="gb-empty">{c.loading}</div>
        ) : runsPage && runsPage.items.length ? (
          <>
            <div className="gb-table-wrap">
              <table className="gb-table">
                <thead>
                  <tr>
                    <th style={{ width: '34%' }}>{s_.thPrompt}</th>
                    <th>{s_.thPlatform}</th>
                    <th>{s_.thSentiment}</th>
                    <th>{s_.thReasoning}</th>
                    <th>{s_.thTime}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {runsPage.items.map((r) => (
                    <tr key={r._id}>
                      <td>{r.promptText}</td>
                      <td>
                        <span className="gb-badge neutral">{PLATFORM_LABEL[r.platform]}</span>
                      </td>
                      <td>
                        <span className={`gb-badge ${LABEL_CLASS[r.sentimentLabel]}`}>{LABEL_TEXT[r.sentimentLabel]}</span>
                      </td>
                      <td style={{ maxWidth: 260 }}>
                        <span style={{ color: 'var(--text-dim)' }}>{r.sentimentReasoning || '—'}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', color: 'var(--text-faint)', fontSize: 11.5 }}>
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <button className="gb-link" onClick={() => setPreviewRun(r)}>
                          {c.viewResponse}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="gb-pagination">
              <button className="gb-btn gb-btn-ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                {c.previous}
              </button>
              <span>{interpolate(c.pageOf, { page, total: totalPages })}</span>
              <button className="gb-btn gb-btn-ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                {c.next}
              </button>
            </div>
          </>
        ) : (
          <div className="gb-empty">
            <strong>{s_.noRunsYetTitle}</strong>
            {platformFilter === 'all'
              ? s_.noRunsYetAllBody
              : interpolate(s_.noRunsYetFilteredBody, { platform: PLATFORM_FILTERS.find((f) => f.value === platformFilter)?.label || '' })}
          </div>
        )}
      </div>

      {previewRun ? (
        <div className="gb-modal-overlay" onClick={() => setPreviewRun(null)}>
          <div className="gb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>{previewRun.promptText}</h3>
                <div className="gb-modal-meta">
                  <span className="gb-badge neutral">{PLATFORM_LABEL[previewRun.platform]}</span>
                  <span className={`gb-badge ${LABEL_CLASS[previewRun.sentimentLabel]}`}>{LABEL_TEXT[previewRun.sentimentLabel]}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(previewRun.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="gb-modal-close" onClick={() => setPreviewRun(null)} aria-label={c.close}>
                ×
              </button>
            </div>
            <div className="gb-modal-body">
              <div className="gb-prose">
                <ReactMarkdown>{previewRun.rawResponse}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
