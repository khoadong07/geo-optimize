'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { API, authHeader, useProjectContext } from './project-context';

type Overview = {
  visibilityScore: number | null;
  targetVisibilityScore: number;
  totalRuns: number;
  trend: { date: string; score: number }[];
  shareOfVoice: { name: string; isBrand: boolean; percent: number }[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number; notApplicable: number } | null;
  platforms: { platform: 'GEMINI' | 'OPENAI'; totalRuns: number; appearanceRatePercent: number | null; avgVisibilityScore: number | null; note: string }[];
  prompts: {
    promptId: string;
    promptSetId: string;
    text: string;
    intent: string;
    visibilityScore: number | null;
    recentSignals: boolean[];
    sovDeltaVsTopCompetitor: number | null;
    topCompetitorName: string | null;
    status: 'target-met' | 'competitor-leading' | 'tracking' | 'no-data';
  }[];
};

type StatusFilter = 'all' | 'target-met' | 'competitor-leading' | 'tracking' | 'no-data';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'competitor-leading', label: 'Competitor leading' },
  { value: 'tracking', label: 'Tracking' },
  { value: 'no-data', label: 'No data' },
  { value: 'target-met', label: 'Target met' },
];

// Worst-first — surfaces prompts needing attention when sorted.
const STATUS_PRIORITY: Record<string, number> = {
  'competitor-leading': 0,
  tracking: 1,
  'no-data': 2,
  'target-met': 3,
};

type RunJob = {
  _id: string;
  status: 'running' | 'completed' | 'failed';
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
} | null;

const SOV_COLORS = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--text-faint)', 'var(--red)'];
const PLATFORM_STYLE: Record<string, { label: string; icon: string; bg: string; color: string }> = {
  GEMINI: { label: 'Gemini', icon: 'Ge', bg: 'var(--blue-dim)', color: 'var(--blue)' },
  OPENAI: { label: 'OpenAI (ChatGPT)', icon: 'Op', bg: 'var(--accent-dim)', color: 'var(--accent)' },
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

function Gauge({ value, target }: { value: number; target: number }) {
  const valueEnd = -90 + (Math.min(value, 100) / 100) * 180;
  const targetAngle = -90 + (Math.min(target, 100) / 100) * 180;
  const targetPos = polarToCartesian(100, 100, 82, targetAngle);
  return (
    <svg width="200" height="118" viewBox="0 0 200 118">
      <path d="M 18 100 A 82 82 0 0 1 182 100" fill="none" stroke="var(--surface-2)" strokeWidth="14" strokeLinecap="round" />
      <path d={describeArc(100, 100, 82, -90, valueEnd)} fill="none" stroke="var(--accent)" strokeWidth="14" strokeLinecap="round" />
      <circle cx={targetPos.x} cy={targetPos.y} r="5" fill="var(--green)" stroke="var(--bg)" strokeWidth="2" />
    </svg>
  );
}

function TrendLine({ trend }: { trend: { date: string; score: number }[] }) {
  if (trend.length < 2) {
    return (
      <div style={{ fontSize: 11.5, color: 'var(--text-faint)', padding: '20px 0' }}>
        Not enough data to chart a trend yet — needs at least 2 days with runs.
      </div>
    );
  }
  const w = 280;
  const h = 64;
  const max = Math.max(...trend.map((t) => t.score), 100);
  const min = Math.min(...trend.map((t) => t.score), 0);
  const range = max - min || 1;
  const points = trend.map((t, i) => {
    const x = (i / (trend.length - 1)) * w;
    const y = h - ((t.score - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <>
      <svg className="gb-trend-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline points={points.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={points[points.length - 1].split(',')[0]} cy={points[points.length - 1].split(',')[1]} r="3" fill="var(--accent)" />
      </svg>
      <div className="gb-trend-meta">
        <span>{trend[0].date}</span>
        <span>
          Today · <b>{trend[trend.length - 1].score}</b>
        </span>
      </div>
    </>
  );
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  'target-met': { label: 'Target met', cls: 'ok' },
  'competitor-leading': { label: 'Competitor leading', cls: 'bad' },
  tracking: { label: 'Tracking', cls: 'warn' },
  'no-data': { label: 'No data', cls: 'neutral' },
};

export default function OverviewPage() {
  const { project } = useProjectContext();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [job, setJob] = useState<RunJob>(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortByStatus, setSortByStatus] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function load() {
    return fetch(`${API}/projects/${project._id}/overview`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setOverview);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(async () => {
      const res = await fetch(`${API}/projects/${project._id}/runs/jobs/latest`, { headers: authHeader() });
      if (!res.ok) return;
      const data: { job: RunJob } = await res.json();
      setJob(data.job);
      if (!data.job || data.job.status !== 'running') {
        stopPolling();
        load();
      }
    }, 2500);
  }

  useEffect(() => {
    load()
      .catch(() => setError('Could not load overview data.'))
      .finally(() => setLoading(false));

    fetch(`${API}/projects/${project._id}/runs/jobs/latest`, { headers: authHeader() })
      .then((res) => (res.ok ? res.json() : { job: null }))
      .then((data: { job: RunJob }) => {
        setJob(data.job);
        if (data.job?.status === 'running') startPolling();
      })
      .catch(() => {});

    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  async function handleRunNow() {
    const pendingPromptIds = overview!.prompts.filter((p) => p.status !== 'target-met').map((p) => p.promptId);
    if (!pendingPromptIds.length) {
      setError('Every prompt has already met its target — nothing to re-run.');
      return;
    }
    setTriggering(true);
    setError('');
    const res = await fetch(`${API}/projects/${project._id}/runs/execute`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptIds: pendingPromptIds }),
    });
    const data = await res.json();
    setTriggering(false);
    if (!res.ok) {
      setError(data.message || 'Could not start the run.');
      return;
    }
    setJob({ _id: data.jobId, status: 'running', totalJobs: data.totalJobs, completedJobs: 0, failedJobs: 0 });
    startPolling();
  }

  const isRunning = job?.status === 'running';
  const progressDone = job ? job.completedJobs + job.failedJobs : 0;
  const pendingCount = overview ? overview.prompts.filter((p) => p.status !== 'target-met').length : 0;

  const progressBanner = isRunning ? (
    <div className="gb-banner info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="gb-live-dot pulse" />
      Running tracking... {progressDone}/{job!.totalJobs} done
      {job!.failedJobs ? ` (${job!.failedJobs} failed)` : ''}
    </div>
  ) : job?.status === 'failed' ? (
    <div className="gb-banner error">The last run failed entirely — try again.</div>
  ) : null;

  if (loading || !overview) {
    return <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading...</p>;
  }

  if (!project.enabledPlatforms.length) {
    return (
      <div className="gb-card gb-empty">
        <strong>No AI platform enabled yet</strong>
        Go to Target Position to enable Gemini/OpenAI before running tracking for the first time.
        <div style={{ marginTop: 16 }}>
          <Link href={`/projects/${project._id}/target`} className="gb-btn gb-btn-primary">
            Go to Target Position
          </Link>
        </div>
      </div>
    );
  }

  if (!overview.totalRuns) {
    return (
      <>
        {progressBanner}
        <div className="gb-card gb-empty">
          <strong>No data yet — run tracking for the first time</strong>
          This project is ready with {overview.prompts.length} prompts and {project.enabledPlatforms.length} AI platforms.
          <div style={{ marginTop: 16 }}>
            <button className="gb-btn gb-btn-primary" onClick={handleRunNow} disabled={triggering || isRunning || !overview.prompts.length}>
              {isRunning ? `Running (${progressDone}/${job!.totalJobs})...` : triggering ? 'Sending request...' : 'Run tracking now'}
            </button>
          </div>
          {!overview.prompts.length ? (
            <p style={{ marginTop: 12 }}>
              No prompts yet.{' '}
              <Link href={`/projects/${project._id}/prompts`} style={{ color: 'var(--accent)' }}>
                Create a prompt set first
              </Link>
              .
            </p>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      {error ? <div className="gb-banner error">{error}</div> : null}
      {progressBanner}

      <div className="gb-hero-grid">
        <div className="gb-card">
          <h2>Visibility Score</h2>
          <p className="gb-card-sub">Avg. over {overview.trend.length} days</p>
          <div className="gb-gauge-wrap">
            <Gauge value={overview.visibilityScore || 0} target={overview.targetVisibilityScore} />
            <div className="gb-gauge-num">
              {overview.visibilityScore}
              <sub>/100</sub>
            </div>
            <div className="gb-gauge-meta">
              <span>
                Target: {overview.targetVisibilityScore} · Gap{' '}
                <b style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {Math.max(0, overview.targetVisibilityScore - (overview.visibilityScore || 0)).toFixed(0)}
                </b>
              </span>
              <span className={`gb-badge ${(overview.visibilityScore || 0) >= overview.targetVisibilityScore ? 'ok' : 'warn'}`}>
                {(overview.visibilityScore || 0) >= overview.targetVisibilityScore ? 'Target met' : 'Below target — amplifying'}
              </span>
            </div>
          </div>
        </div>

        <div className="gb-card">
          <h2>Share of Voice</h2>
          <p className="gb-card-sub">By mention count</p>
          {overview.shareOfVoice.length ? (
            overview.shareOfVoice.map((s, i) => (
              <div className="gb-row" key={s.name}>
                <span className="gb-row-label" style={{ color: s.isBrand ? 'var(--text)' : 'var(--text-dim)' }}>
                  {s.name}
                  {s.isBrand ? ' (you)' : ''}
                </span>
                <div className="gb-track">
                  <div className="gb-fill" style={{ width: `${s.percent}%`, background: SOV_COLORS[i % SOV_COLORS.length] }} />
                </div>
                <span className="gb-pct">{s.percent}%</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>No brand or competitor mentions yet.</p>
          )}
        </div>

        <div className="gb-card">
          <h2>Trend {overview.trend.length ? `(${overview.trend.length}d)` : '(14d)'}</h2>
          <p className="gb-card-sub">Visibility Score</p>
          <TrendLine trend={overview.trend} />
        </div>
      </div>

      <div className="gb-section">
        Tracked by AI platform <span className="count">{project.enabledPlatforms.length} active</span>
      </div>
      <div className="gb-platform-grid">
        {overview.platforms.map((p) => {
          const style = PLATFORM_STYLE[p.platform];
          return (
            <div className="gb-platform-card" key={p.platform}>
              <div className="gb-platform-head">
                <div className="gb-plat-icn" style={{ background: style.bg, color: style.color }}>
                  {style.icon}
                </div>
                <div>
                  <div className="gb-platform-name">{style.label}</div>
                  <div className="gb-platform-sub">
                    {p.totalRuns ? `Appears ${p.appearanceRatePercent}% · ${p.totalRuns} runs` : 'No runs yet'}
                  </div>
                </div>
                <div className="gb-platform-pct">{p.appearanceRatePercent ?? '—'}%</div>
              </div>
              <div className="gb-track">
                <div className="gb-fill" style={{ width: `${p.appearanceRatePercent || 0}%`, background: 'var(--accent)' }} />
              </div>
              <div className="gb-platform-sub" style={{ marginTop: 8 }}>
                {p.note}
              </div>
            </div>
          );
        })}
      </div>

      <div className="gb-section">
        Prompts tracked <span className="count">{overview.prompts.length}</span>
        <button
          className="gb-btn gb-btn-ghost"
          style={{ marginLeft: 'auto' }}
          onClick={handleRunNow}
          disabled={triggering || isRunning || !pendingCount}
          title={!pendingCount ? 'Every prompt has already met its target' : `Only re-run ${pendingCount} prompts below target`}
        >
          {isRunning ? `Running (${progressDone}/${job!.totalJobs})` : triggering ? 'Sending...' : `Re-run tracking (${pendingCount} below target)`}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            className={`gb-btn gb-btn-ghost gb-chip${statusFilter === f.value ? ' active' : ''}`}
            onClick={() => setStatusFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <button className={`gb-btn gb-btn-ghost gb-chip${sortByStatus ? ' active' : ''}`} style={{ marginLeft: 'auto' }} onClick={() => setSortByStatus((v) => !v)}>
          Sort by status
        </button>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        <div className="gb-table-wrap">
          <table className="gb-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Prompt</th>
                <th>Recent signal</th>
                <th>Visibility</th>
                <th>SOV vs. competitor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {overview.prompts
                .filter((p) => statusFilter === 'all' || p.status === statusFilter)
                .sort((a, b) => (sortByStatus ? STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] : 0))
                .map((p) => {
                  const status = STATUS_LABEL[p.status];
                  return (
                    <tr key={`${p.promptSetId}-${p.promptId}`}>
                      <td>
                        {p.text}
                        <br />
                        <span className={`gb-tag ${p.intent}`}>{p.intent}</span>
                      </td>
                      <td>
                        <div className="gb-dots">
                          {p.recentSignals.length ? (
                            p.recentSignals.map((hit, i) => <span key={i} className={`gb-dot ${hit ? 'hit' : 'miss'}`} />)
                          ) : (
                            <span style={{ color: 'var(--text-faint)' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td>{p.visibilityScore !== null ? `${p.visibilityScore}%` : '—'}</td>
                      <td>
                        {p.sovDeltaVsTopCompetitor !== null ? (
                          <span className={`gb-delta ${p.sovDeltaVsTopCompetitor >= 0 ? 'up' : 'down'}`}>
                            {p.sovDeltaVsTopCompetitor >= 0 ? '+' : ''}
                            {p.sovDeltaVsTopCompetitor}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-faint)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`gb-badge ${status.cls}`}>{status.label}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {overview.prompts.filter((p) => statusFilter === 'all' || p.status === statusFilter).length === 0 ? (
            <div className="gb-empty">No prompts match this filter.</div>
          ) : null}
        </div>
      </div>
    </>
  );
}
