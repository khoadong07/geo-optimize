'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
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

const PLATFORM_FILTERS: { value: PlatformFilter; label: string }[] = [
  { value: 'all', label: 'All platforms' },
  { value: 'GEMINI', label: 'Gemini' },
  { value: 'OPENAI', label: 'OpenAI' },
];

const PLATFORM_LABEL: Record<Run['platform'], string> = { GEMINI: 'Gemini', OPENAI: 'OpenAI' };

const LABEL_TEXT: Record<Run['sentimentLabel'], string> = {
  POSITIVE: 'Positive',
  NEUTRAL: 'Neutral',
  NEGATIVE: 'Negative',
  NOT_APPLICABLE: 'Not applicable',
};

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

function PositiveRateTrend({ trend }: { trend: SentimentStats['trend'] }) {
  if (trend.length < 2) {
    return (
      <p style={{ fontSize: 11.5, color: 'var(--text-faint)', padding: '20px 0' }}>
        Not enough data to chart a trend yet — needs at least 2 days with runs.
      </p>
    );
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
          Today · <b>{trend[trend.length - 1].positive}% positive</b>
        </span>
      </div>
    </>
  );
}

export default function SentimentPage() {
  const { project } = useProjectContext();
  const [breakdown, setBreakdown] = useState<Breakdown>(null);
  const [stats, setStats] = useState<SentimentStats | null>(null);
  const [runsPage, setRunsPage] = useState<RunsPage | null>(null);
  const [loadingRuns, setLoadingRuns] = useState(true);
  const [error, setError] = useState('');
  const [previewRun, setPreviewRun] = useState<Run | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${API}/projects/${project._id}/overview`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data) => setBreakdown(data.sentimentBreakdown))
      .catch(() => setError('Could not load sentiment data.'));
    fetch(`${API}/projects/${project._id}/sentiment-stats`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data: SentimentStats) => setStats(data))
      .catch(() => setError('Could not load sentiment data.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  useEffect(() => {
    setLoadingRuns(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (platformFilter !== 'all') params.set('platform', platformFilter);
    fetch(`${API}/projects/${project._id}/runs?${params.toString()}`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data: RunsPage) => setRunsPage(data))
      .catch(() => setError('Could not load the run list.'))
      .finally(() => setLoadingRuns(false));
  }, [project._id, platformFilter, page]);

  function handleFilterChange(f: PlatformFilter) {
    setPlatformFilter(f);
    setPage(1);
  }

  const totalPages = runsPage ? Math.max(1, Math.ceil(runsPage.total / runsPage.limit)) : 1;

  return (
    <>
      <p className="gb-eyebrow">Project</p>
      <h2 className="gb-title">Sentiment</h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        How the AI's response treats the brand, scored by an LLM-as-judge.
      </p>

      {error ? <div className="gb-banner error">{error}</div> : null}

      <div className="gb-card" style={{ marginBottom: 20 }}>
        <h2>Sentiment overview</h2>
        <p className="gb-card-sub">Across every recorded run, all platforms</p>
        {breakdown ? (
          <div className="gb-donut-row" style={{ marginTop: 12 }}>
            <Donut breakdown={breakdown} />
            <div className="gb-legend">
              <div className="gb-legend-item">
                <i style={{ background: 'var(--green)' }} />
                Positive<b>{breakdown.positive}%</b>
              </div>
              <div className="gb-legend-item">
                <i style={{ background: 'var(--blue)' }} />
                Neutral<b>{breakdown.neutral}%</b>
              </div>
              <div className="gb-legend-item">
                <i style={{ background: 'var(--red)' }} />
                Negative<b>{breakdown.negative}%</b>
              </div>
              <div className="gb-legend-item">
                <i style={{ background: 'var(--text-faint)' }} />
                Not applicable<b>{breakdown.notApplicable}%</b>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12 }}>No runs recorded yet.</p>
        )}
      </div>

      {stats && stats.totalRuns ? (
        <>
          <div className="gb-hero-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="gb-card">
              <h2>By platform</h2>
              <p className="gb-card-sub">Sentiment split per AI engine</p>
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
              <h2>By intent</h2>
              <p className="gb-card-sub">Sentiment split per prompt intent</p>
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
              <h2>Positive-rate trend</h2>
              <p className="gb-card-sub">Share of positive runs per day</p>
              <PositiveRateTrend trend={stats.trend} />
            </div>

            <div className="gb-card">
              <h2>Top topics</h2>
              <p className="gb-card-sub">Most frequent themes the judge extracted</p>
              {stats.topTopics.length ? (
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {stats.topTopics.map((t) => (
                    <span key={t.topic} className="gb-pill" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                      {t.topic}
                      <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-faint)' }}>{t.count}</b>
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 12 }}>No topics extracted yet.</p>
              )}
            </div>
          </div>
        </>
      ) : null}

      <div className="gb-section">
        Recent runs <span className="count">{runsPage?.total ?? 0}</span>
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
          <div className="gb-empty">Loading...</div>
        ) : runsPage && runsPage.items.length ? (
          <>
            <div className="gb-table-wrap">
              <table className="gb-table">
                <thead>
                  <tr>
                    <th style={{ width: '34%' }}>Prompt</th>
                    <th>Platform</th>
                    <th>Sentiment</th>
                    <th>Reasoning</th>
                    <th>Time</th>
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
                          View response
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="gb-pagination">
              <button className="gb-btn gb-btn-ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button className="gb-btn gb-btn-ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="gb-empty">
            <strong>No runs yet</strong>
            {platformFilter === 'all'
              ? 'Run tracking from the Overview page to start recording sentiment.'
              : `No runs recorded on ${PLATFORM_FILTERS.find((f) => f.value === platformFilter)?.label}.`}
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
              <button className="gb-modal-close" onClick={() => setPreviewRun(null)} aria-label="Close">
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
