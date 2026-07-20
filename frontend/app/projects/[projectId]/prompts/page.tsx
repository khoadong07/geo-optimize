'use client';

import { FormEvent, useEffect, useState } from 'react';
import { industryLabel } from '../../../industry';
import { API, authHeader, useProjectContext } from '../project-context';

const INTENTS = ['Discovery', 'Comparison', 'Branded', 'Long-tail'];

type PromptRow = {
  promptId: string;
  promptSetId: string;
  text: string;
  intent: string;
  visibilityScore: number | null;
  recentSignals: boolean[];
  status: 'target-met' | 'competitor-leading' | 'tracking' | 'no-data';
};

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  'target-met': { label: 'Target met', cls: 'ok' },
  'competitor-leading': { label: 'Competitor leading', cls: 'bad' },
  tracking: { label: 'Tracking', cls: 'warn' },
  'no-data': { label: 'No data', cls: 'neutral' },
};

type StatusFilter = 'all' | 'target-met' | 'competitor-leading' | 'tracking' | 'no-data';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'competitor-leading', label: 'Competitor leading' },
  { value: 'tracking', label: 'Tracking' },
  { value: 'no-data', label: 'No data' },
  { value: 'target-met', label: 'Target met' },
];

const STATUS_PRIORITY: Record<string, number> = {
  'competitor-leading': 0,
  tracking: 1,
  'no-data': 2,
  'target-met': 3,
};

export default function PromptsPage() {
  const { project } = useProjectContext();
  const [prompts, setPrompts] = useState<PromptRow[] | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortByStatus, setSortByStatus] = useState(false);

  // AI generation flow
  const [genIntent, setGenIntent] = useState('Discovery');
  const [genLoading, setGenLoading] = useState(false);
  const [candidates, setCandidates] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [genSetName, setGenSetName] = useState('');
  const [addingSelected, setAddingSelected] = useState(false);

  // Trending topics feeding into AI generation
  const [trendingPeriod, setTrendingPeriod] = useState<'week' | 'month' | null>(null);
  const [trendingItems, setTrendingItems] = useState<string[] | null>(null);
  const [selectedTrending, setSelectedTrending] = useState<Set<string>>(new Set());
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Manual single-prompt flow
  const [setName, setSetName] = useState('');
  const [promptText, setPromptText] = useState('');
  const [intent, setIntent] = useState('Discovery');
  const [creating, setCreating] = useState(false);

  // Edit/delete existing prompts
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editIntent, setEditIntent] = useState('Discovery');
  const [savingEdit, setSavingEdit] = useState(false);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets] = useState<PromptRow[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    return fetch(`${API}/projects/${project._id}/overview`, { headers: authHeader() })
      .then((res) => res.json())
      .then((data) => setPrompts(data.prompts));
  }

  useEffect(() => {
    load().catch(() => setError('Could not load the prompt list.'));
  }, [project._id]);

  async function handleGenerate() {
    setGenLoading(true);
    setError('');
    setSuccess('');
    const res = await fetch(`${API}/projects/${project._id}/prompt-sets/generate`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: genIntent, trendingTopics: Array.from(selectedTrending) }),
    });
    const data = await res.json();
    setGenLoading(false);
    if (!res.ok) {
      setError(data.message || 'Could not generate questions.');
      return;
    }
    setCandidates(data.candidates);
    setSelected(new Set(data.candidates));
    setGenSetName(`${genIntent} — ${project.name}`);
  }

  async function handleFetchTrending(period: 'week' | 'month') {
    setLoadingTrending(true);
    setError('');
    const params = new URLSearchParams({ industry: project.industry || project.name, period });
    const res = await fetch(`${API}/trending?${params.toString()}`, { headers: authHeader() });
    const data = await res.json();
    setLoadingTrending(false);
    if (!res.ok) {
      setError(data.message || 'Could not load trending topics.');
      return;
    }
    setTrendingPeriod(period);
    setTrendingItems(data.items);
    setSelectedTrending(new Set());
  }

  function toggleTrending(item: string) {
    setSelectedTrending((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  function toggleCandidate(text: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  }

  async function handleAddSelected() {
    if (!selected.size) return;
    setAddingSelected(true);
    setError('');
    setSuccess('');
    const res = await fetch(`${API}/projects/${project._id}/prompt-sets`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: genSetName,
        prompts: Array.from(selected).map((text) => ({ text, intent: genIntent })),
      }),
    });
    const data = await res.json();
    setAddingSelected(false);
    if (!res.ok) {
      setError(data.message || 'Could not add prompts.');
      return;
    }
    setSuccess(`Added ${selected.size} prompts to "${data.name}".`);
    setCandidates(null);
    setSelected(new Set());
    setGenSetName('');
    load();
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    const res = await fetch(`${API}/projects/${project._id}/prompt-sets`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: setName, prompts: [{ text: promptText, intent }] }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.message || 'Could not create prompt.');
      return;
    }
    setSuccess(`Added prompt to "${data.name}".`);
    setSetName('');
    setPromptText('');
    setIntent('Discovery');
    load();
  }

  function startEdit(p: PromptRow) {
    setEditingKey(`${p.promptSetId}-${p.promptId}`);
    setEditText(p.text);
    setEditIntent(p.intent);
    setError('');
    setSuccess('');
  }

  async function handleSaveEdit(p: PromptRow) {
    setSavingEdit(true);
    setError('');
    const res = await fetch(`${API}/projects/${project._id}/prompt-sets/${p.promptSetId}/prompts/${p.promptId}`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText, intent: editIntent }),
    });
    const data = await res.json();
    setSavingEdit(false);
    if (!res.ok) {
      setError(data.message || 'Could not update prompt.');
      return;
    }
    setEditingKey(null);
    setSuccess('Prompt updated.');
    load();
  }

  function promptKey(p: PromptRow) {
    return `${p.promptSetId}-${p.promptId}`;
  }

  function toggleChecked(key: string) {
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function performDelete() {
    if (!deleteTargets?.length) return;
    setDeleting(true);
    setError('');
    const results = await Promise.all(
      deleteTargets.map((p) =>
        fetch(`${API}/projects/${project._id}/prompt-sets/${p.promptSetId}/prompts/${p.promptId}`, {
          method: 'DELETE',
          headers: authHeader(),
        }).then((res) => res.ok),
      ),
    );
    setDeleting(false);
    const failedCount = results.filter((ok) => !ok).length;
    const deletedCount = results.length - failedCount;
    setDeleteTargets(null);
    setCheckedKeys(new Set());
    if (deletedCount) setSuccess(`Deleted ${deletedCount} prompt${deletedCount === 1 ? '' : 's'}.`);
    if (failedCount) setError(`Failed to delete ${failedCount} prompt${failedCount === 1 ? '' : 's'}.`);
    load();
  }

  const visiblePrompts = (prompts || [])
    .filter((p) => statusFilter === 'all' || p.status === statusFilter)
    .sort((a, b) => (sortByStatus ? STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status] : 0));
  const allVisibleChecked = visiblePrompts.length > 0 && visiblePrompts.every((p) => checkedKeys.has(promptKey(p)));

  function toggleCheckAll() {
    setCheckedKeys((prev) => {
      if (allVisibleChecked) return new Set();
      return new Set(visiblePrompts.map(promptKey));
    });
  }

  return (
    <>
      <p className="gb-eyebrow">Project</p>
      <h2 className="gb-title">Ranking &amp; Prompts</h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        Every tracked prompt and how each question ranks for visibility.
      </p>

      {error ? <div className="gb-banner error">{error}</div> : null}
      {success ? <div className="gb-banner info">{success}</div> : null}

      <div className="gb-card" style={{ marginBottom: 20 }}>
        <h2>Generate questions with AI</h2>
        <p className="gb-card-sub">
          Based on the industry &quot;{industryLabel(project.industry) || 'unspecified'}&quot;, brand &quot;{project.name}&quot;, and configured competitors — generates 7 questions for the intent selected below.
        </p>

        <div className="gb-field">Industry trending topics (optional — keeps questions on-trend)</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`gb-btn gb-btn-ghost gb-chip${trendingPeriod === 'week' ? ' active' : ''}`}
            onClick={() => handleFetchTrending('week')}
            disabled={loadingTrending}
          >
            Trending this week
          </button>
          <button
            type="button"
            className={`gb-btn gb-btn-ghost gb-chip${trendingPeriod === 'month' ? ' active' : ''}`}
            onClick={() => handleFetchTrending('month')}
            disabled={loadingTrending}
          >
            Trending this month
          </button>
          {loadingTrending ? <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Loading...</span> : null}
          {selectedTrending.size ? <span style={{ fontSize: 12, color: 'var(--accent)' }}>{selectedTrending.size} topics selected</span> : null}
        </div>

        {trendingItems ? (
          <div style={{ marginTop: 12, marginBottom: 4, maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px' }}>
            {trendingItems.map((item) => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border-soft)', fontSize: 12.5 }}>
                <input type="checkbox" className="gb-checkbox" checked={selectedTrending.has(item)} onChange={() => toggleTrending(item)} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        ) : null}

        <div className="gb-field">Intent</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select className="gb-input" style={{ maxWidth: 220 }} value={genIntent} onChange={(e) => setGenIntent(e.target.value)}>
            {INTENTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <button type="button" className="gb-btn gb-btn-primary" onClick={handleGenerate} disabled={genLoading}>
            {genLoading ? 'Generating...' : 'Generate 7 questions'}
          </button>
        </div>

        {candidates ? (
          <div style={{ marginTop: 18 }}>
            {candidates.map((c) => (
              <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-soft)', fontSize: 13 }}>
                <input type="checkbox" className="gb-checkbox" checked={selected.has(c)} onChange={() => toggleCandidate(c)} />
                <span>{c}</span>
              </label>
            ))}

            <div className="gb-field">Prompt set name</div>
            <input className="gb-input" value={genSetName} onChange={(e) => setGenSetName(e.target.value)} required />

            <div style={{ marginTop: 16 }}>
              <button className="gb-btn gb-btn-primary" onClick={handleAddSelected} disabled={addingSelected || !selected.size}>
                {addingSelected ? 'Adding...' : `Add ${selected.size} selected`}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="gb-card" style={{ marginBottom: 20 }}>
        <h2>Add a prompt manually</h2>
        <p className="gb-card-sub">Write a specific question instead of letting AI generate one.</p>
        <form onSubmit={handleCreate}>
          <div className="gb-field">Prompt set name</div>
          <input className="gb-input" value={setName} onChange={(e) => setSetName(e.target.value)} placeholder="e.g. Discovery — Acme" required />

          <div className="gb-field">Prompt text</div>
          <input
            className="gb-input"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="What's the safest app for transferring money?"
            required
          />

          <div className="gb-field">Intent</div>
          <select className="gb-input" value={intent} onChange={(e) => setIntent(e.target.value)}>
            {INTENTS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>

          <div style={{ marginTop: 16 }}>
            <button className="gb-btn gb-btn-ghost" type="submit" disabled={creating}>
              {creating ? 'Creating...' : '+ Add prompt'}
            </button>
          </div>
        </form>
      </div>

      <div className="gb-section">
        All prompts <span className="count">{prompts?.length ?? 0}</span>
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
        <button
          className={`gb-btn gb-btn-ghost gb-chip${sortByStatus ? ' active' : ''}`}
          style={{ marginLeft: checkedKeys.size ? undefined : 'auto' }}
          onClick={() => setSortByStatus((v) => !v)}
        >
          Sort by status
        </button>
        {checkedKeys.size ? (
          <button
            className="gb-btn gb-btn-ghost"
            style={{ marginLeft: 'auto', color: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={() => setDeleteTargets((prompts || []).filter((p) => checkedKeys.has(promptKey(p))))}
          >
            Delete selected ({checkedKeys.size})
          </button>
        ) : null}
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        {!prompts ? (
          <div className="gb-empty">Loading...</div>
        ) : prompts.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox" className="gb-checkbox" checked={allVisibleChecked} onChange={toggleCheckAll} />
                  </th>
                  <th style={{ width: '34%' }}>Prompt</th>
                  <th>Recent signal</th>
                  <th>Visibility</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visiblePrompts.map((p) => {
                  const status = STATUS_LABEL[p.status];
                  const key = promptKey(p);
                  const isEditing = editingKey === key;
                  return (
                    <tr key={key}>
                      <td>
                        <input type="checkbox" className="gb-checkbox" checked={checkedKeys.has(key)} onChange={() => toggleChecked(key)} />
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="gb-inline-edit" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <input className="gb-input" value={editText} onChange={(e) => setEditText(e.target.value)} />
                            <select className="gb-input" value={editIntent} onChange={(e) => setEditIntent(e.target.value)}>
                              {INTENTS.map((i) => (
                                <option key={i} value={i}>
                                  {i}
                                </option>
                              ))}
                            </select>
                            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                              <button className="gb-btn gb-btn-primary" onClick={() => handleSaveEdit(p)} disabled={savingEdit}>
                                {savingEdit ? 'Saving...' : 'Save'}
                              </button>
                              <button className="gb-btn gb-btn-ghost" onClick={() => setEditingKey(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {p.text}
                            <br />
                            <span className={`gb-tag ${p.intent}`}>{p.intent}</span>
                          </>
                        )}
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
                        <span className={`gb-badge ${status.cls}`}>{status.label}</span>
                      </td>
                      <td>
                        {!isEditing ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="gb-link" onClick={() => startEdit(p)}>
                              Edit
                            </button>
                            <button className="gb-link danger" onClick={() => setDeleteTargets([p])}>
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {visiblePrompts.length === 0 ? <div className="gb-empty">No prompts match this filter.</div> : null}
          </div>
        ) : (
          <div className="gb-empty">
            <strong>No prompts yet</strong>
            Use the forms above to add your first one.
          </div>
        )}
      </div>

      {deleteTargets ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTargets(null)}>
          <div className="gb-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>Delete {deleteTargets.length} prompt{deleteTargets.length === 1 ? '' : 's'}?</h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>This cannot be undone.</p>
              </div>
              <button className="gb-modal-close" onClick={() => setDeleteTargets(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="gb-modal-body">
              <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
                {deleteTargets.slice(0, 10).map((p) => (
                  <li key={promptKey(p)} style={{ fontSize: 13 }}>
                    {p.text}
                  </li>
                ))}
              </ul>
              {deleteTargets.length > 10 ? (
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8 }}>and {deleteTargets.length - 10} more...</p>
              ) : null}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="gb-btn gb-btn-ghost" onClick={() => setDeleteTargets(null)} disabled={deleting}>
                  Cancel
                </button>
                <button className="gb-btn gb-btn-primary" style={{ background: 'var(--red)' }} onClick={performDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : `Delete ${deleteTargets.length} prompt${deleteTargets.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
