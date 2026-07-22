'use client';

import { FormEvent, useState } from 'react';
import { useLanguage } from '../../../i18n';
import { API, authHeader, useProjectContext } from '../project-context';

export default function TargetPage() {
  const { project, refresh } = useProjectContext();
  const { t } = useLanguage();
  const c = t.app.common;
  const g_ = t.app.target;
  const [targetScore, setTargetScore] = useState(project.targetVisibilityScore);
  const [platforms, setPlatforms] = useState<Set<string>>(new Set(project.enabledPlatforms));
  const [runsPerPrompt, setRunsPerPrompt] = useState(project.runsPerPrompt);
  const [competitorsText, setCompetitorsText] = useState(project.competitors.join(', '));
  const [domain, setDomain] = useState(project.domain || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const PLATFORMS: Array<{ key: 'GEMINI' | 'OPENAI'; label: string; note: string }> = [
    { key: 'GEMINI', label: 'Gemini', note: g_.geminiNote },
    { key: 'OPENAI', label: 'OpenAI (ChatGPT)', note: g_.openaiNote },
  ];

  function togglePlatform(key: string) {
    setPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const competitors = competitorsText
      .split(',')
      .map((cc) => cc.trim())
      .filter(Boolean);
    const res = await fetch(`${API}/projects/${project._id}`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetVisibilityScore: targetScore,
        enabledPlatforms: Array.from(platforms),
        runsPerPrompt,
        competitors,
        domain: domain.trim() || undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.message || g_.couldNotSaveConfig);
      return;
    }
    setSuccess(g_.configSaved);
    refresh();
  }

  return (
    <>
      <p className="gb-eyebrow">{c.configuration}</p>
      <h2 className="gb-title">{t.app.layout.navTarget}</h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        {g_.subtitle}
      </p>

      {error ? <div className="gb-banner error">{error}</div> : null}
      {success ? <div className="gb-banner info">{success}</div> : null}

      <form onSubmit={handleSave}>
        <div className="gb-card" style={{ marginBottom: 16 }}>
          <h2>{g_.platformsTitle}</h2>
          <p className="gb-card-sub">{g_.platformsSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 12 }}>
            {PLATFORMS.map((p) => (
              <div key={p.key} className={`gb-pick${platforms.has(p.key) ? ' selected' : ''}`} onClick={() => togglePlatform(p.key)}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>{p.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gb-card" style={{ marginBottom: 16 }}>
          <h2>{g_.targetFrequencyTitle}</h2>
          <div className="gb-field">{g_.targetScoreLabel}</div>
          <input
            className="gb-input"
            type="number"
            min={0}
            max={100}
            value={targetScore}
            onChange={(e) => setTargetScore(Number(e.target.value))}
          />

          <div className="gb-field">{g_.runsPerPromptLabel}</div>
          <div className="gb-stepper">
            <button type="button" onClick={() => setRunsPerPrompt((n) => Math.max(1, n - 1))}>
              −
            </button>
            <span className="n">{runsPerPrompt}</span>
            <button type="button" onClick={() => setRunsPerPrompt((n) => Math.min(10, n + 1))}>
              +
            </button>
          </div>

          <div className="gb-field">{g_.competitorsLabel}</div>
          <input
            className="gb-input"
            value={competitorsText}
            onChange={(e) => setCompetitorsText(e.target.value)}
            placeholder={g_.competitorsPlaceholder}
          />

          <div className="gb-field">{g_.websiteLabel}</div>
          <input className="gb-input" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder={g_.websitePlaceholder} />
          <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>{g_.websiteHint}</p>
        </div>

        <button className="gb-btn gb-btn-primary" type="submit" disabled={saving}>
          {saving ? c.saving : g_.saveConfig}
        </button>
      </form>
    </>
  );
}
