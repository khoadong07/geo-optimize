'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { interpolate, useLanguage } from '../../../i18n';
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

const CHECK_ORDER = ['robots_txt', 'llms_txt', 'schema_jsonld', 'meta_tags', 'content', 'signals', 'ai_discovery', 'brand_entity'];

export default function GapCitationPage() {
  const { project } = useProjectContext();
  const { t } = useLanguage();
  const c = t.app.common;
  const g_ = t.app.gapCitation;
  const [audit, setAudit] = useState<SiteAudit | null | undefined>(undefined);
  const [job, setJob] = useState<AuditJob>(null);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState('');
  const [showSkillInfo, setShowSkillInfo] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const BAND_STYLE: Record<string, { label: string; cls: string }> = {
    excellent: { label: g_.bandLabels.excellent, cls: 'ok' },
    good: { label: g_.bandLabels.good, cls: 'ok' },
    foundation: { label: g_.bandLabels.foundation, cls: 'warn' },
    critical: { label: g_.bandLabels.critical, cls: 'bad' },
  };

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
    loadAudit().catch(() => setError(g_.couldNotLoadAudit));

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
      setError(data.message || g_.couldNotStartAudit);
      return;
    }
    setJob({ _id: data.jobId, status: 'running', errorMessage: null });
    startPolling();
  }

  const isRunning = job?.status === 'running';

  const progressBanner = isRunning ? (
    <div className="gb-banner info" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span className="gb-live-dot pulse" />
      {interpolate(g_.auditingDomain, { domain: project.domain || '' })}
    </div>
  ) : job?.status === 'failed' ? (
    <div className="gb-banner error">{interpolate(g_.auditFailed, { message: job.errorMessage || 'unknown error' })}</div>
  ) : null;

  return (
    <>
      <p className="gb-eyebrow">{c.project}</p>
      <h2 className="gb-title">{t.app.layout.navGapCitation}</h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        {g_.subtitlePre}
        <button className="gb-link" style={{ fontSize: 'inherit' }} onClick={() => setShowSkillInfo(true)}>
          {g_.subtitleLink}
        </button>
        {g_.subtitlePost}
      </p>

      {error ? <div className="gb-banner error">{error}</div> : null}
      {progressBanner}

      {!project.domain ? (
        <div className="gb-card gb-empty">
          <strong>{g_.noWebsiteTitle}</strong>
          {g_.noWebsiteBody}
          <div style={{ marginTop: 16 }}>
            <Link href={`/projects/${project._id}/target`} className="gb-btn gb-btn-primary">
              {t.app.overview.goToTargetPosition}
            </Link>
          </div>
        </div>
      ) : audit === undefined ? (
        <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{c.loading}</p>
      ) : !audit ? (
        <div className="gb-card gb-empty">
          <strong>{g_.noAuditYetTitle}</strong>
          {interpolate(g_.runFirstAudit, { domain: project.domain })}
          <div style={{ marginTop: 16 }}>
            <button className="gb-btn gb-btn-primary" onClick={handleRunAudit} disabled={triggering || isRunning}>
              {isRunning ? c.running : triggering ? c.sendingRequest : g_.runAuditNow}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="gb-hero-grid" style={{ gridTemplateColumns: '1fr 2fr' }}>
            <div className="gb-card">
              <h2>{g_.geoScoreTitle}</h2>
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
                {interpolate(g_.auditedAt, { date: new Date(audit.createdAt).toLocaleString() })}
                {audit.auditDurationMs ? ` · ${(audit.auditDurationMs / 1000).toFixed(1)}s` : ''}
              </p>
              <button className="gb-btn gb-btn-ghost" style={{ width: '100%' }} onClick={handleRunAudit} disabled={triggering || isRunning}>
                {isRunning ? c.running : triggering ? c.sending : g_.runAuditAgain}
              </button>
            </div>

            <div className="gb-card">
              <h2>{g_.breakdownTitle}</h2>
              <p className="gb-card-sub">{g_.breakdownSub}</p>
              <div style={{ marginTop: 8 }}>
                {CHECK_ORDER.filter((key) => audit.checks[key]).map((key) => {
                  const cCheck = audit.checks[key];
                  const pct = cCheck.max ? Math.round((cCheck.score / cCheck.max) * 100) : 0;
                  return (
                    <div className="gb-row" key={key}>
                      <span className="gb-row-label" style={{ width: 140 }}>
                        {g_.checkLabels[key] || key}
                      </span>
                      <div className="gb-track">
                        <div
                          className="gb-fill"
                          style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--accent)' : 'var(--red)' }}
                        />
                      </div>
                      <span className="gb-pct">
                        {cCheck.score}/{cCheck.max}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="gb-section">
            {g_.recommendationsTitle} <span className="count">{audit.recommendations.length}</span>
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
              <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>{g_.noRecommendations}</p>
            )}
          </div>
        </>
      )}

      {showSkillInfo ? (
        <div className="gb-modal-overlay" onClick={() => setShowSkillInfo(false)}>
          <div className="gb-modal" style={{ maxWidth: 760, height: '80vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>{g_.skillModalTitle}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>{g_.skillModalDesc}</p>
              </div>
              <button className="gb-modal-close" onClick={() => setShowSkillInfo(false)} aria-label={c.close}>
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
