'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { industryLabel, PROJECT_INDUSTRIES } from '../../industry';
import { interpolate, useLanguage } from '../../i18n';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const CHECK_ORDER = ['robots_txt', 'llms_txt', 'schema_jsonld', 'meta_tags', 'content', 'signals', 'ai_discovery', 'brand_entity'];

type Project = {
  _id: string;
  name: string;
  industry?: string;
  domain?: string;
  competitors: string[];
  leadCaptured?: boolean;
};

type RunJob = { status: 'running' | 'completed' | 'failed'; totalJobs: number; completedJobs: number; failedJobs: number } | null;
type AuditJob = { status: 'running' | 'completed' | 'failed' } | null;
type SentimentBreakdown = { positive: number; neutral: number; negative: number; notApplicable: number };
type Overview = { visibilityScore: number | null; sentimentBreakdown: SentimentBreakdown | null; prompts: { text: string; intent: string }[] };
type Audit = { score: number; band: string; recommendations: string[] } | null;

type Phase = 'loading' | 'invalid' | 'setup' | 'running' | 'report';

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const duration = 800;
    let raf = 0;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return value;
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5 6.2 12 13 4" />
    </svg>
  );
}

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

function Gauge({ value, color }: { value: number; color: string }) {
  const valueEnd = -90 + (Math.min(Math.max(value, 0), 100) / 100) * 180;
  return (
    <svg width="200" height="118" viewBox="0 0 200 118">
      <path d="M 18 100 A 82 82 0 0 1 182 100" fill="none" stroke="var(--surface-2)" strokeWidth="14" strokeLinecap="round" />
      <path d={describeArc(100, 100, 82, -90, valueEnd)} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
}

function Donut({ breakdown }: { breakdown: SentimentBreakdown }) {
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
          const el = <circle key={i} cx="55" cy="55" r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-cum} />;
          cum += len;
          return el;
        })}
      </g>
    </svg>
  );
}

function bandColor(band?: string) {
  if (band === 'excellent' || band === 'good') return 'var(--green)';
  if (band === 'foundation') return 'var(--accent)';
  if (band === 'critical') return 'var(--red)';
  return 'var(--text-faint)';
}

export default function TrialFlowPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { lang, t } = useLanguage();
  const tf = t.trialFlow;
  const checkLabels = t.app.gapCitation.checkLabels;

  const [phase, setPhase] = useState<Phase>('loading');
  const [project, setProject] = useState<Project | null>(null);
  const [token, setToken] = useState('');

  // setup step
  const [brandName, setBrandName] = useState('');
  const [industry, setIndustry] = useState(PROJECT_INDUSTRIES[0]);
  const [competitors, setCompetitors] = useState<Set<string>>(new Set());
  const [newCompetitor, setNewCompetitor] = useState('');
  const [settingUp, setSettingUp] = useState(false);
  const [setupError, setSetupError] = useState('');

  // running step
  const [runJob, setRunJob] = useState<RunJob>(null);
  const [auditJob, setAuditJob] = useState<AuditJob>(null);
  const [promptList, setPromptList] = useState<{ text: string; intent: string }[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // report step
  const [overview, setOverview] = useState<Overview | null>(null);
  const [audit, setAudit] = useState<Audit>(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadError, setLeadError] = useState('');

  // Hooks must run unconditionally on every render (not after the phase
  // early-returns below), so the count-up reveal values live up here even
  // though they're only rendered in the 'report' phase.
  const visibilityValue = useCountUp(overview?.visibilityScore ?? 0, phase === 'report' && !!overview);
  const sentimentValue = useCountUp(overview?.sentimentBreakdown?.positive ?? 0, phase === 'report' && !!overview?.sentimentBreakdown);
  const geoValue = useCountUp(audit?.score ?? 0, phase === 'report' && !!audit);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      window.localStorage.setItem('geo_token', urlToken);
      window.history.replaceState({}, '', `/trial/${projectId}`);
    }
    const storedToken = window.localStorage.getItem('geo_token');
    if (!storedToken) {
      setPhase('invalid');
      return;
    }
    setToken(storedToken);

    fetch(`${API}/projects/${projectId}`, { headers: authHeader(storedToken) })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then(async (proj: Project) => {
        setProject(proj);
        setBrandName(proj.name);
        setIndustry(proj.industry || PROJECT_INDUSTRIES[0]);
        setLeadCaptured(!!proj.leadCaptured);

        const suggestionsRaw = window.sessionStorage.getItem('geo_trial_suggestions');
        if (suggestionsRaw) {
          try {
            const suggestions: string[] = JSON.parse(suggestionsRaw);
            setCompetitors(new Set(suggestions));
          } catch {
            /* ignore malformed sessionStorage value */
          }
        }

        const jobRes = await fetch(`${API}/projects/${projectId}/runs/jobs/latest`, { headers: authHeader(storedToken) });
        const jobData = await jobRes.json();
        if (jobData.job) {
          setPhase(jobData.job.status === 'running' ? 'running' : 'report');
        } else {
          setPhase('setup');
        }
      })
      .catch(() => setPhase('invalid'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function toggleCompetitor(name: string) {
    setCompetitors((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleAddCompetitor() {
    const name = newCompetitor.trim();
    if (!name) return;
    setCompetitors((prev) => new Set(prev).add(name));
    setNewCompetitor('');
  }

  async function handleConfirmSetup(e: FormEvent) {
    e.preventDefault();
    setSettingUp(true);
    setSetupError('');
    const res = await fetch(`${API}/trial/projects/${projectId}/setup`, {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ competitors: Array.from(competitors), industry, brandName, lang }),
    });
    setSettingUp(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setSetupError(data.message || tf.setupError);
      return;
    }
    setPhase('running');
  }

  // Fetch the real generated questions once, as soon as the run starts, so
  // the "running" screen can show the visitor's actual prompts resolving
  // one by one instead of a generic spinner.
  useEffect(() => {
    if (phase !== 'running' || !token || promptList.length) return;
    fetch(`${API}/projects/${projectId}/overview`, { headers: authHeader(token) })
      .then((res) => res.json())
      .then((data: Overview) => setPromptList(data.prompts || []));
  }, [phase, token, projectId, promptList.length]);

  useEffect(() => {
    if (phase !== 'running' || !token) return;

    async function poll() {
      const [runRes, auditRes] = await Promise.all([
        fetch(`${API}/projects/${projectId}/runs/jobs/latest`, { headers: authHeader(token) }),
        fetch(`${API}/projects/${projectId}/site-audit/jobs/latest`, { headers: authHeader(token) }),
      ]);
      const runData = await runRes.json();
      const auditData = await auditRes.json();
      setRunJob(runData.job);
      setAuditJob(auditData.job);

      const runDone = !runData.job || runData.job.status !== 'running';
      const auditDone = !auditData.job || auditData.job.status !== 'running';
      if (runDone && auditDone) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase('report');
      }
    }

    poll();
    pollRef.current = setInterval(poll, 2500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [phase, token, projectId]);

  useEffect(() => {
    if (phase !== 'report' || !token) return;
    Promise.all([
      fetch(`${API}/projects/${projectId}/overview`, { headers: authHeader(token) }).then((r) => r.json()),
      fetch(`${API}/projects/${projectId}/site-audit`, { headers: authHeader(token) }).then((r) => r.json()),
    ]).then(([overviewData, auditData]) => {
      setOverview(overviewData);
      setAudit(auditData.audit);
    });
  }, [phase, token, projectId]);

  async function handleSubmitLead(e: FormEvent) {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadError('');
    const res = await fetch(`${API}/trial/projects/${projectId}/lead`, {
      method: 'POST',
      headers: { ...authHeader(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: leadName, email: leadEmail, company: leadCompany }),
    });
    setSubmittingLead(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLeadError(data.message || tf.leadError);
      return;
    }
    setLeadCaptured(true);
  }

  if (phase === 'loading') {
    return (
      <div className="gb-auth-wrap">
        <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t.trial.analyzing}</p>
      </div>
    );
  }

  if (phase === 'invalid') {
    return (
      <div className="gb-auth-wrap">
        <div className="gb-auth-card">
          <p className="gb-eyebrow">GeoBase</p>
          <h1>{tf.invalidTitle}</h1>
          <p>{tf.invalidBody}</p>
          <button className="gb-btn gb-btn-primary" onClick={() => router.push('/')}>
            {tf.backHome}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <main className="gb-container">
        <div className="gb-header plain">
          <div>
            <p className="gb-eyebrow">{tf.setupEyebrow}</p>
            <h1 className="gb-title-lg">{tf.setupTitle}</h1>
            <p className="gb-subtitle">{tf.setupSubtitle}</p>
          </div>
        </div>

        <form className="gb-card" style={{ maxWidth: 560 }} onSubmit={handleConfirmSetup}>
          <div className="gb-field">{tf.brandNameLabel}</div>
          <input className="gb-input" value={brandName} onChange={(e) => setBrandName(e.target.value)} required />

          <div className="gb-field" style={{ marginTop: 16 }}>
            {tf.industryLabel}
          </div>
          <select className="gb-input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {PROJECT_INDUSTRIES.map((ind) => (
              <option key={ind} value={ind}>
                {industryLabel(ind, lang)}
              </option>
            ))}
          </select>

          <div className="gb-field" style={{ marginTop: 16 }}>
            {tf.competitorsLabel}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: -4, marginBottom: 10 }}>{tf.competitorsHint}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from(competitors).map((name) => (
              <label key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
                <input type="checkbox" checked onChange={() => toggleCompetitor(name)} />
                {name}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              className="gb-input"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              placeholder={tf.addCompetitorPlaceholder}
            />
            <button type="button" className="gb-btn gb-btn-ghost" onClick={handleAddCompetitor}>
              {tf.addButton}
            </button>
          </div>

          {setupError ? (
            <div className="gb-banner error" style={{ marginTop: 16 }}>
              {setupError}
            </div>
          ) : null}

          <button className="gb-btn gb-btn-primary" type="submit" style={{ marginTop: 20 }} disabled={settingUp}>
            {settingUp ? tf.settingUp : tf.confirmButton}
          </button>
        </form>
      </main>
    );
  }

  if (phase === 'running') {
    const questionsDone = (runJob?.completedJobs || 0) + (runJob?.failedJobs || 0);
    const questionsTotal = runJob?.totalJobs || promptList.length || 10;
    const auditDone = !!auditJob && auditJob.status !== 'running';

    return (
      <main className="gb-container">
        <div className="gb-header plain">
          <div>
            <p className="gb-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="gb-live-dot pulse" aria-hidden="true" />
              {tf.runningTitle}
            </p>
            <h1 className="gb-title-lg">{project?.name}</h1>
          </div>
        </div>

        <div className="gb-trial-panels">
          <div className="gb-trial-panel">
            <div className="gb-trial-panel-head">
              <span className="gb-trial-panel-label">{tf.runningQuestionsHeading}</span>
              <span className="gb-trial-panel-count">
                {questionsDone}/{questionsTotal}
              </span>
            </div>
            {promptList.length ? (
              promptList.map((p, i) => {
                const state = i < questionsDone ? 'done' : i === questionsDone ? 'active' : 'pending';
                return (
                  <div key={i} className={`gb-trial-qrow ${state}`}>
                    <span className="gb-trial-check">
                      {state === 'done' ? (
                        <CheckIcon />
                      ) : state === 'active' ? (
                        <span className="gb-trial-typing" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : null}
                    </span>
                    <span className="gb-trial-qtext">{p.text}</span>
                  </div>
                );
              })
            ) : (
              <div className="gb-trial-qrow active">
                <span className="gb-trial-check">
                  <span className="gb-trial-typing" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </span>
                <span className="gb-trial-qtext">{tf.runningQuestionsHeading}</span>
              </div>
            )}
          </div>

          <div className="gb-trial-panel">
            <div className="gb-trial-panel-head">
              <span className="gb-trial-panel-label">{tf.runningAuditHeading}</span>
              <span className="gb-trial-panel-count">{auditDone ? '8/8' : '···'}</span>
            </div>
            {CHECK_ORDER.map((key, i) => (
              <div key={key} className={`gb-trial-audit-row ${auditDone ? 'done' : ''}`}>
                <span className="gb-trial-check" style={auditDone ? { animationDelay: `${i * 70}ms` } : undefined}>
                  {auditDone ? <CheckIcon /> : null}
                </span>
                <span>{checkLabels[key] || key}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // phase === 'report'
  return (
    <main className="gb-container">
      <div className="gb-header plain">
        <div>
          <p className="gb-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="gb-live-dot pulse" aria-hidden="true" />
            {tf.reportEyebrow}
          </p>
          <h1 className="gb-title-lg">{tf.reportTitle}</h1>
          <p className="gb-subtitle">{tf.reportSubtitle}</p>
        </div>
      </div>

      <div className="gb-hero-grid">
        <div className="gb-card">
          <h2>{tf.visibilityScoreLabel}</h2>
          <p className="gb-card-sub">{tf.visibilityScoreHint}</p>
          <div className="gb-gauge-wrap">
            <Gauge value={overview?.visibilityScore ?? 0} color="var(--accent)" />
            <div className="gb-gauge-num">
              {overview ? visibilityValue : '—'}
              <sub>/100</sub>
            </div>
          </div>
        </div>

        <div className="gb-card">
          <h2>{tf.sentimentLabel}</h2>
          <p className="gb-card-sub">{tf.sentimentHint}</p>
          {overview?.sentimentBreakdown ? (
            <div className="gb-donut-row" style={{ marginTop: 12 }}>
              <Donut breakdown={overview.sentimentBreakdown} />
              <div className="gb-legend">
                <div className="gb-legend-item">
                  <i style={{ background: 'var(--green)' }} />
                  {t.app.sentiment.positiveLabel}
                  <b>{sentimentValue}%</b>
                </div>
                <div className="gb-legend-item">
                  <i style={{ background: 'var(--blue)' }} />
                  {t.app.sentiment.neutralLabel}
                  <b>{overview.sentimentBreakdown.neutral}%</b>
                </div>
                <div className="gb-legend-item">
                  <i style={{ background: 'var(--red)' }} />
                  {t.app.sentiment.negativeLabel}
                  <b>{overview.sentimentBreakdown.negative}%</b>
                </div>
                <div className="gb-legend-item">
                  <i style={{ background: 'var(--text-faint)' }} />
                  {t.app.sentiment.notApplicableLabel}
                  <b>{overview.sentimentBreakdown.notApplicable}%</b>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-faint)', fontSize: 12.5, marginTop: 12 }}>—</p>
          )}
        </div>

        <div className="gb-card">
          <h2>{tf.geoScoreLabel}</h2>
          <p className="gb-card-sub">{audit ? project?.domain : '—'}</p>
          <div className="gb-gauge-wrap">
            <Gauge value={audit?.score ?? 0} color={bandColor(audit?.band)} />
            <div className="gb-gauge-num">
              {audit ? geoValue : '—'}
              <sub>/100</sub>
            </div>
            {audit ? (
              <div className="gb-gauge-meta">
                <span
                  className={`gb-badge ${bandColor(audit.band) === 'var(--green)' ? 'ok' : bandColor(audit.band) === 'var(--red)' ? 'bad' : 'warn'}`}
                >
                  {t.app.gapCitation.bandLabels[audit.band] || audit.band}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {audit?.recommendations?.length ? (
        <div className="gb-trial-reco" style={{ marginBottom: 20 }}>
          <span>
            <b>{tf.topRecommendationLabel}:</b> {audit.recommendations[0]}
          </span>
        </div>
      ) : null}

      <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 24 }}>{tf.singleRunCaveat}</p>

      {leadCaptured ? (
        <div className="gb-card" style={{ maxWidth: 480 }}>
          <h2>{tf.leadSuccessTitle}</h2>
          <p>{tf.leadSuccessBody}</p>
          <button className="gb-btn gb-btn-primary" onClick={() => router.push(`/projects/${projectId}`)}>
            {tf.viewDashboardCta}
          </button>
        </div>
      ) : (
        <form className="gb-card" style={{ maxWidth: 480 }} onSubmit={handleSubmitLead}>
          <h2>{tf.leadTitle}</h2>
          <p className="gb-card-sub">{tf.leadSubtitle}</p>
          <div className="gb-field">{tf.leadNameLabel}</div>
          <input className="gb-input" value={leadName} onChange={(e) => setLeadName(e.target.value)} required />
          <div className="gb-field" style={{ marginTop: 12 }}>
            {tf.leadEmailLabel}
          </div>
          <input type="email" className="gb-input" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} required />
          <div className="gb-field" style={{ marginTop: 12 }}>
            {tf.leadCompanyLabel}
          </div>
          <input className="gb-input" value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} />

          {leadError ? (
            <div className="gb-banner error" style={{ marginTop: 14 }}>
              {leadError}
            </div>
          ) : null}

          <button className="gb-btn gb-btn-primary" type="submit" style={{ marginTop: 16 }} disabled={submittingLead}>
            {submittingLead ? tf.leadSubmitting : tf.leadSubmit}
          </button>
        </form>
      )}

      <div className="gb-section" style={{ marginTop: 40 }}>
        <span>{tf.reportPricingEyebrow}</span>
      </div>
      <h2 className="gb-title" style={{ marginBottom: 4 }}>
        {tf.reportPricingTitle}
      </h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        {tf.reportPricingBody}
      </p>
      <div className="gb-mkt-pricing">
        {t.pricing.plans.map((plan, i) => (
          <div className={`gb-mkt-price${i === 1 ? ' featured' : ''}`} key={plan.name}>
            {i === 1 ? <span className="gb-mkt-price-badge">{t.pricing.mostPopular}</span> : null}
            <div className="gb-mkt-price-name">{plan.name}</div>
            {plan.desc ? <div className="gb-mkt-price-desc">{plan.desc}</div> : null}
            <div className="gb-mkt-price-amount">
              {plan.price}
              {plan.period ? <span>{plan.period}</span> : null}
            </div>
            <ul className="gb-mkt-price-list">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {plan.slug === 'enterprise' ? (
              <Link href="/" className="gb-btn gb-btn-ghost" style={{ textAlign: 'center' }}>
                {plan.cta}
              </Link>
            ) : (
              <Link href={`/checkout/${plan.slug}`} className={`gb-btn ${i === 1 ? 'gb-btn-primary' : 'gb-btn-ghost'}`} style={{ textAlign: 'center' }}>
                {plan.cta}
              </Link>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
