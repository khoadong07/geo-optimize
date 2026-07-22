'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { interpolate, useLanguage } from '../../i18n';
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

function TrendLine({ trend, notEnoughDataText, todayText }: { trend: { date: string; score: number }[]; notEnoughDataText: string; todayText: string }) {
  if (trend.length < 2) {
    return <div style={{ fontSize: 11.5, color: 'var(--text-faint)', padding: '20px 0' }}>{notEnoughDataText}</div>;
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
          {todayText} · <b>{trend[trend.length - 1].score}</b>
        </span>
      </div>
    </>
  );
}

export default function OverviewPage() {
  const { project } = useProjectContext();
  const { t } = useLanguage();
  const c = t.app.common;
  const o = t.app.overview;
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [job, setJob] = useState<RunJob>(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortByStatus, setSortByStatus] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: c.statusAll },
    { value: 'competitor-leading', label: c.statusCompetitorLeading },
    { value: 'tracking', label: c.statusTracking },
    { value: 'no-data', label: c.statusNoData },
    { value: 'target-met', label: c.statusTargetMet },
  ];

  const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
    'target-met': { label: c.statusTargetMet, cls: 'ok' },
    'competitor-leading': { label: c.statusCompetitorLeading, cls: 'bad' },
    tracking: { label: c.statusTracking, cls: 'warn' },
    'no-data': { label: c.statusNoData, cls: 'neutral' },
  };

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
      .catch(() => setError(o.couldNotLoadOverview))
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
      setError(o.everyPromptMetError);
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
      setError(data.message || o.couldNotStartRun);
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
      {interpolate(o.runningTracking, { done: progressDone, total: job!.totalJobs })}
      {job!.failedJobs ? interpolate(o.failedSuffix, { n: job!.failedJobs }) : ''}
    </div>
  ) : job?.status === 'failed' ? (
    <div className="gb-banner error">{o.lastRunFailed}</div>
  ) : null;

  if (loading || !overview) {
    return <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.loading}</p>;
  }

  if (!project.enabledPlatforms.length) {
    return (
      <div className="gb-card gb-empty">
        <strong>{o.noAiPlatformTitle}</strong>
        {o.noAiPlatformBody}
        <div style={{ marginTop: 16 }}>
          <Link href={`/projects/${project._id}/target`} className="gb-btn gb-btn-primary">
            {o.goToTargetPosition}
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
          <strong>{o.noDataYetTitle}</strong>
          {interpolate(o.readyWithPrompts, { prompts: overview.prompts.length, platforms: project.enabledPlatforms.length })}
          <div style={{ marginTop: 16 }}>
            <button className="gb-btn gb-btn-primary" onClick={handleRunNow} disabled={triggering || isRunning || !overview.prompts.length}>
              {isRunning ? interpolate(o.runningProgress, { done: progressDone, total: job!.totalJobs }) + '...' : triggering ? c.sendingRequest : o.runTrackingNow}
            </button>
          </div>
          {!overview.prompts.length ? (
            <p style={{ marginTop: 12 }}>
              {o.noPromptsYetInline}{' '}
              <Link href={`/projects/${project._id}/prompts`} style={{ color: 'var(--accent)' }}>
                {o.createPromptSetFirst}
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
          <h2>{o.visibilityScore}</h2>
          <p className="gb-card-sub">{interpolate(o.avgOverDays, { days: overview.trend.length })}</p>
          <div className="gb-gauge-wrap">
            <Gauge value={overview.visibilityScore || 0} target={overview.targetVisibilityScore} />
            <div className="gb-gauge-num">
              {overview.visibilityScore}
              <sub>/100</sub>
            </div>
            <div className="gb-gauge-meta">
              <span>
                {interpolate(o.targetGap, { target: overview.targetVisibilityScore })}{' '}
                <b style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  {Math.max(0, overview.targetVisibilityScore - (overview.visibilityScore || 0)).toFixed(0)}
                </b>
              </span>
              <span className={`gb-badge ${(overview.visibilityScore || 0) >= overview.targetVisibilityScore ? 'ok' : 'warn'}`}>
                {(overview.visibilityScore || 0) >= overview.targetVisibilityScore ? o.targetMet : o.belowTarget}
              </span>
            </div>
          </div>
        </div>

        <div className="gb-card">
          <h2>{o.shareOfVoice}</h2>
          <p className="gb-card-sub">{o.byMentionCount}</p>
          {overview.shareOfVoice.length ? (
            overview.shareOfVoice.map((s, i) => (
              <div className="gb-row" key={s.name}>
                <span className="gb-row-label" style={{ color: s.isBrand ? 'var(--text)' : 'var(--text-dim)' }}>
                  {s.name}
                  {s.isBrand ? o.youSuffix : ''}
                </span>
                <div className="gb-track">
                  <div className="gb-fill" style={{ width: `${s.percent}%`, background: SOV_COLORS[i % SOV_COLORS.length] }} />
                </div>
                <span className="gb-pct">{s.percent}%</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{o.noBrandMentions}</p>
          )}
        </div>

        <div className="gb-card">
          <h2>
            {o.trend} {overview.trend.length ? interpolate(o.trendDays, { n: overview.trend.length }) : o.trendDefault}
          </h2>
          <p className="gb-card-sub">{o.trendSub}</p>
          <TrendLine trend={overview.trend} notEnoughDataText={c.notEnoughDataTrend} todayText={c.today} />
        </div>
      </div>

      <div className="gb-section">
        {o.trackedByPlatform} <span className="count">{interpolate(o.activeCount, { n: project.enabledPlatforms.length })}</span>
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
                    {p.totalRuns ? interpolate(o.appears, { pct: p.appearanceRatePercent ?? 0, n: p.totalRuns }) : o.noRunsYet}
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
        {o.promptsTracked} <span className="count">{overview.prompts.length}</span>
        <button
          className="gb-btn gb-btn-ghost"
          style={{ marginLeft: 'auto' }}
          onClick={handleRunNow}
          disabled={triggering || isRunning || !pendingCount}
          title={!pendingCount ? o.everyPromptMetTooltip : interpolate(o.onlyRerunTooltip, { n: pendingCount })}
        >
          {isRunning ? interpolate(o.runningProgress, { done: progressDone, total: job!.totalJobs }) : triggering ? c.sending : interpolate(o.reRunTracking, { n: pendingCount })}
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
          {c.sortByStatus}
        </button>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        <div className="gb-table-wrap">
          <table className="gb-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>{o.thPrompt}</th>
                <th>{o.thRecentSignal}</th>
                <th>{o.thVisibility}</th>
                <th>{o.thSovVsCompetitor}</th>
                <th>{o.thStatus}</th>
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
            <div className="gb-empty">{o.noPromptsFilter}</div>
          ) : null}
        </div>
      </div>
    </>
  );
}
