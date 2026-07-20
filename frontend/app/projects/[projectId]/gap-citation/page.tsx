'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { API, authHeader, useProjectContext } from '../project-context';

type CheckResult = { score: number; max: number; passed: boolean; details: Record<string, unknown> };

type SiteAudit = {
  url: string;
  score: number;
  band: string;
  error: string | null;
  checks: Record<string, CheckResult>;
  scoreBreakdown: Record<string, number>;
  recommendations: string[];
  httpStatus: number | null;
  auditDurationMs: number | null;
  createdAt: string;
};

type AuditJob = { _id: string; status: 'running' | 'completed' | 'failed'; errorMessage: string | null } | null;

const CHECK_LABELS: Record<string, string> = {
  robots_txt: 'Robots.txt',
  llms_txt: 'llms.txt',
  schema_jsonld: 'Schema JSON-LD',
  meta_tags: 'Meta tags',
  content: 'Content',
  signals: 'Page signals',
  ai_discovery: 'AI discovery',
  brand_entity: 'Brand entity',
};

const CHECK_ORDER = ['robots_txt', 'llms_txt', 'schema_jsonld', 'meta_tags', 'content', 'signals', 'ai_discovery', 'brand_entity'];

const BAND_STYLE: Record<string, { label: string; cls: string }> = {
  excellent: { label: 'Excellent', cls: 'ok' },
  good: { label: 'Good', cls: 'ok' },
  foundation: { label: 'Foundation', cls: 'warn' },
  critical: { label: 'Critical', cls: 'bad' },
};

export default function GapCitationPage() {
  const { project } = useProjectContext();
  const [audit, setAudit] = useState<SiteAudit | null | undefined>(undefined);
  const [job, setJob] = useState<AuditJob>(null);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState('');
  const [showSkillInfo, setShowSkillInfo] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function loadAudit() {
    return fetch(`${API}/projects/${project._id}/site-audit`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data: { audit: SiteAudit | null }) => setAudit(data.audit));
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
      const res = await fetch(`${API}/projects/${project._id}/site-audit/jobs/latest`, { headers: authHeader() });
      if (!res.ok) return;
      const data: { job: AuditJob } = await res.json();
      setJob(data.job);
      if (!data.job || data.job.status !== 'running') {
        stopPolling();
        loadAudit();
      }
    }, 3000);
  }

  useEffect(() => {
    loadAudit().catch(() => setError('Could not load the audit result.'));

    fetch(`${API}/projects/${project._id}/site-audit/jobs/latest`, { headers: authHeader() })
      .then((res) => (res.ok ? res.json() : { job: null }))
      .then((data: { job: AuditJob }) => {
        setJob(data.job);
        if (data.job?.status === 'running') startPolling();
      })
      .catch(() => {});

    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  async function handleRunAudit() {
    setTriggering(true);
    setError('');
    const res = await fetch(`${API}/projects/${project._id}/site-audit/run`, {
      method: 'POST',
      headers: authHeader(),
    });
    const data = await res.json();
    setTriggering(false);
    if (!res.ok) {
      setError(data.message || 'Could not start the audit.');
      return;
    }
    setJob({ _id: data.jobId, status: 'running', errorMessage: null });
    startPolling();
  }

  const isRunning = job?.status === 'running';

  const progressBanner = isRunning ? (
    <div className="gb-banner info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="gb-live-dot pulse" />
      Auditing {project.domain} — fetching the live page can take 10-60s...
    </div>
  ) : job?.status === 'failed' ? (
    <div className="gb-banner error">Audit failed: {job.errorMessage || 'unknown error'}</div>
  ) : null;

  return (
    <>
      <p className="gb-eyebrow">Project</p>
      <h2 className="gb-title">Gap &amp; Citation</h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        A technical GEO audit of the website — how ready it is for AI crawlers to crawl and cite (scored by{' '}
        <button className="gb-link" style={{ fontSize: 'inherit' }} onClick={() => setShowSkillInfo(true)}>
          geo-optimizer-skill
        </button>
        ).
      </p>

      {error ? <div className="gb-banner error">{error}</div> : null}
      {progressBanner}

      {!project.domain ? (
        <div className="gb-card gb-empty">
          <strong>This project has no website set</strong>
          Set an &quot;Official website&quot; on Target Position to run a GEO audit.
          <div style={{ marginTop: 16 }}>
            <Link href={`/projects/${project._id}/target`} className="gb-btn gb-btn-primary">
              Go to Target Position
            </Link>
          </div>
        </div>
      ) : audit === undefined ? (
        <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading...</p>
      ) : !audit ? (
        <div className="gb-card gb-empty">
          <strong>No audit yet</strong>
          Run the first audit for {project.domain}.
          <div style={{ marginTop: 16 }}>
            <button className="gb-btn gb-btn-primary" onClick={handleRunAudit} disabled={triggering || isRunning}>
              {isRunning ? 'Running...' : triggering ? 'Sending request...' : 'Run audit now'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="gb-hero-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <div className="gb-card">
              <h2>GEO score</h2>
              <p className="gb-card-sub">{audit.url}</p>
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 700 }}>
                  {audit.score}
                  <span style={{ fontSize: 14, color: 'var(--text-faint)', fontWeight: 500 }}>/100</span>
                </div>
                <span className={`gb-badge ${BAND_STYLE[audit.band]?.cls || 'neutral'}`} style={{ marginTop: 8, display: 'inline-flex' }}>
                  {BAND_STYLE[audit.band]?.label || audit.band}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', textAlign: 'center' }}>
                Audited {new Date(audit.createdAt).toLocaleString()}
                {audit.auditDurationMs ? ` · ${(audit.auditDurationMs / 1000).toFixed(1)}s` : ''}
              </p>
              <button className="gb-btn gb-btn-ghost" style={{ width: '100%' }} onClick={handleRunAudit} disabled={triggering || isRunning}>
                {isRunning ? 'Running...' : triggering ? 'Sending...' : 'Run audit again'}
              </button>
            </div>

            <div className="gb-card">
              <h2>Breakdown by category</h2>
              <p className="gb-card-sub">8 categories scored by geo-optimizer-skill</p>
              <div style={{ marginTop: 8 }}>
                {CHECK_ORDER.filter((key) => audit.checks[key]).map((key) => {
                  const c = audit.checks[key];
                  const pct = c.max ? Math.round((c.score / c.max) * 100) : 0;
                  return (
                    <div className="gb-row" key={key}>
                      <span className="gb-row-label" style={{ width: 140 }}>
                        {CHECK_LABELS[key] || key}
                      </span>
                      <div className="gb-track">
                        <div
                          className="gb-fill"
                          style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--accent)' : 'var(--red)' }}
                        />
                      </div>
                      <span className="gb-pct">
                        {c.score}/{c.max}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="gb-section">
            Recommendations <span className="count">{audit.recommendations.length}</span>
          </div>
          <div className="gb-card">
            {audit.recommendations.length ? (
              <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 10 }}>
                {audit.recommendations.map((r, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>No recommendations — every category checks out.</p>
            )}
          </div>
        </>
      )}

      {showSkillInfo ? (
        <div className="gb-modal-overlay" onClick={() => setShowSkillInfo(false)}>
          <div className="gb-modal" style={{ maxWidth: 760, height: '80vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>geo-optimizer-skill</h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
                  The third-party audit tool GeoBase uses on this page.
                </p>
              </div>
              <button className="gb-modal-close" onClick={() => setShowSkillInfo(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="gb-modal-body" style={{ padding: 0, flex: 1 }}>
              <iframe src="/geo-optimizer-skill.html" title="geo-optimizer-skill summary" style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
