'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { API, authHeader } from '../admin-context';

type Period = 'week' | 'month';

type TrendingTopic = {
  _id: string;
  industry: string;
  period: Period;
  text: string;
  createdAt?: string;
};

type PeriodFilter = 'all' | Period;

export default function AdminTrendingTopicsPage() {
  const [topics, setTopics] = useState<TrendingTopic[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [industryFilter, setIndustryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [deleteTargets, setDeleteTargets] = useState<TrendingTopic[] | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Create-industry form — sets up a brand new industry with its weekly and/or monthly list in one step.
  const [newIndustryName, setNewIndustryName] = useState('');
  const [newIndustryWeekly, setNewIndustryWeekly] = useState('');
  const [newIndustryMonthly, setNewIndustryMonthly] = useState('');
  const [creatingIndustry, setCreatingIndustry] = useState(false);

  // Add-more form — appends questions (one per line) to an industry that already exists.
  const [addIndustry, setAddIndustry] = useState('');
  const [addPeriod, setAddPeriod] = useState<Period>('week');
  const [addTexts, setAddTexts] = useState('');
  const [adding, setAdding] = useState(false);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIndustry, setEditIndustry] = useState('');
  const [editPeriod, setEditPeriod] = useState<Period>('week');
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  function load() {
    return fetch(`${API}/trending-topics`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setTopics);
  }

  useEffect(() => {
    load()
      .catch(() => setError('Could not load trending topics.'))
      .finally(() => setLoading(false));
  }, []);

  const industries = useMemo(() => Array.from(new Set((topics || []).map((t) => t.industry))).sort(), [topics]);

  useEffect(() => {
    if (!industries.length) {
      setAddIndustry('');
      return;
    }
    if (!industries.includes(addIndustry)) setAddIndustry(industries[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industries]);

  const visibleTopics = (topics || []).filter(
    (t) => (industryFilter === 'all' || t.industry === industryFilter) && (periodFilter === 'all' || t.period === periodFilter),
  );

  const weekCount = (topics || []).filter((t) => t.period === 'week').length;
  const monthCount = (topics || []).filter((t) => t.period === 'month').length;

  const allVisibleChecked = visibleTopics.length > 0 && visibleTopics.every((t) => checkedIds.has(t._id));

  function toggleChecked(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCheckAll() {
    setCheckedIds((prev) => {
      if (allVisibleChecked) return new Set();
      return new Set(visibleTopics.map((t) => t._id));
    });
  }

  function parseLines(value: string) {
    return value
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
  }

  async function postBulk(industry: string, period: Period, texts: string[]) {
    const res = await fetch(`${API}/trending-topics/bulk`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry, period, texts }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, message: data.message as string | undefined };
  }

  async function handleCreateIndustry(e: FormEvent) {
    e.preventDefault();
    const industry = newIndustryName.trim();
    const weekly = parseLines(newIndustryWeekly);
    const monthly = parseLines(newIndustryMonthly);
    if (!industry || (!weekly.length && !monthly.length)) return;
    setCreatingIndustry(true);
    setError('');
    setSuccess('');

    const results = await Promise.all([
      weekly.length ? postBulk(industry, 'week', weekly) : null,
      monthly.length ? postBulk(industry, 'month', monthly) : null,
    ]);
    setCreatingIndustry(false);

    const failed = results.filter((r) => r && !r.ok);
    if (failed.length) {
      setError(failed[0]?.message || 'Could not create the industry.');
      load();
      return;
    }
    const total = weekly.length + monthly.length;
    setSuccess(`Created "${industry}" with ${total} topic${total === 1 ? '' : 's'}.`);
    setNewIndustryName('');
    setNewIndustryWeekly('');
    setNewIndustryMonthly('');
    load();
  }

  async function handleAddMore(e: FormEvent) {
    e.preventDefault();
    const texts = parseLines(addTexts);
    if (!addIndustry.trim() || !texts.length) return;
    setAdding(true);
    setError('');
    setSuccess('');
    const result = await postBulk(addIndustry.trim(), addPeriod, texts);
    setAdding(false);
    if (!result.ok) {
      setError(result.message || 'Could not add trending topics.');
      return;
    }
    setSuccess(`Added ${texts.length} topic${texts.length === 1 ? '' : 's'} to "${addIndustry.trim()}".`);
    setAddTexts('');
    load();
  }

  function startEdit(t: TrendingTopic) {
    setEditingId(t._id);
    setEditIndustry(t.industry);
    setEditPeriod(t.period);
    setEditText(t.text);
    setError('');
    setSuccess('');
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    setError('');
    const res = await fetch(`${API}/trending-topics/${id}`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry: editIndustry.trim(), period: editPeriod, text: editText.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingEdit(false);
    if (!res.ok) {
      setError(data.message || 'Could not update topic.');
      return;
    }
    setEditingId(null);
    load();
  }

  async function performDelete() {
    if (!deleteTargets?.length) return;
    setDeleting(true);
    setError('');
    const results = await Promise.all(
      deleteTargets.map((t) => fetch(`${API}/trending-topics/${t._id}`, { method: 'DELETE', headers: authHeader() }).then((res) => res.ok)),
    );
    setDeleting(false);
    const failedCount = results.filter((ok) => !ok).length;
    const deletedCount = results.length - failedCount;
    setDeleteTargets(null);
    setCheckedIds(new Set());
    if (deletedCount) setSuccess(`Deleted ${deletedCount} topic${deletedCount === 1 ? '' : 's'}.`);
    if (failedCount) setError(`Failed to delete ${failedCount} topic${failedCount === 1 ? '' : 's'}.`);
    load();
  }

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">Trending topics</h1>
          <p className="gb-subtitle">
            Manage the weekly/monthly trending questions surfaced during AI prompt generation. This feature is Vietnam-market only.
          </p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}
      {success ? <div className="gb-banner info">{success}</div> : null}

      <div className="gb-stats">
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{topics?.length ?? 0}</div>
          <div className="gb-stat-label">Total topics</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{industries.length}</div>
          <div className="gb-stat-label">Industries</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{weekCount}</div>
          <div className="gb-stat-label">Weekly topics</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{monthCount}</div>
          <div className="gb-stat-label">Monthly topics</div>
        </div>
      </div>

      <div className="gb-card" style={{ marginBottom: 20 }}>
        <h2>Create new industry</h2>
        <p className="gb-card-sub">
          Name the industry and paste its weekly and/or monthly question lists (one question per line). Fill in at least one list.
        </p>
        <form onSubmit={handleCreateIndustry}>
          <div className="gb-field">Industry name</div>
          <input
            className="gb-input"
            value={newIndustryName}
            onChange={(e) => setNewIndustryName(e.target.value)}
            placeholder="e.g. Retail, Insurance, Real Estate"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
            <div>
              <div className="gb-field">Weekly questions (optional)</div>
              <textarea
                className="gb-input"
                rows={6}
                value={newIndustryWeekly}
                onChange={(e) => setNewIndustryWeekly(e.target.value)}
                placeholder={'Thương hiệu nào đang được chú ý nhiều nhất tuần này?\nCó khuyến mãi nổi bật nào tuần này không?'}
              />
            </div>
            <div>
              <div className="gb-field">Monthly questions (optional)</div>
              <textarea
                className="gb-input"
                rows={6}
                value={newIndustryMonthly}
                onChange={(e) => setNewIndustryMonthly(e.target.value)}
                placeholder={'Xu hướng lớn nhất tháng này là gì?\nThương hiệu nào dẫn đầu thị phần hiện nay?'}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button
              className="gb-btn gb-btn-primary"
              type="submit"
              disabled={creatingIndustry || !newIndustryName.trim() || (!newIndustryWeekly.trim() && !newIndustryMonthly.trim())}
            >
              {creatingIndustry ? 'Creating...' : '+ Create industry'}
            </button>
          </div>
        </form>
      </div>

      <div className="gb-card" style={{ marginBottom: 20 }}>
        <h2>Add more questions</h2>
        <p className="gb-card-sub">Append questions to an industry that already has topics.</p>
        {industries.length ? (
          <form onSubmit={handleAddMore}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12 }}>
              <div>
                <div className="gb-field">Industry</div>
                <select className="gb-input" value={addIndustry} onChange={(e) => setAddIndustry(e.target.value)}>
                  {industries.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="gb-field">Period</div>
                <select className="gb-input" value={addPeriod} onChange={(e) => setAddPeriod(e.target.value as Period)}>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
            </div>

            <div className="gb-field">Questions</div>
            <textarea
              className="gb-input"
              rows={5}
              value={addTexts}
              onChange={(e) => setAddTexts(e.target.value)}
              placeholder={'Ngân hàng nào có lãi suất tiết kiệm cao nhất tuần này?\nNgân hàng nào đang miễn phí chuyển khoản liên ngân hàng 24/7?'}
              required
            />

            <div style={{ marginTop: 16 }}>
              <button className="gb-btn gb-btn-ghost" type="submit" disabled={adding}>
                {adding ? 'Adding...' : '+ Add questions'}
              </button>
            </div>
          </form>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Create an industry above first.</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <select className="gb-input" style={{ width: 'auto', padding: '7px 10px', fontSize: 12.5 }} value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}>
          <option value="all">All industries</option>
          {industries.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        {(['all', 'week', 'month'] as PeriodFilter[]).map((p) => (
          <button
            key={p}
            className={`gb-btn gb-btn-ghost gb-chip${periodFilter === p ? ' active' : ''}`}
            onClick={() => setPeriodFilter(p)}
          >
            {p === 'all' ? 'All periods' : p === 'week' ? 'Weekly' : 'Monthly'}
          </button>
        ))}
        {checkedIds.size ? (
          <button
            className="gb-btn gb-btn-ghost"
            style={{ marginLeft: 'auto', color: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={() => setDeleteTargets(visibleTopics.filter((t) => checkedIds.has(t._id)))}
          >
            Delete selected ({checkedIds.size})
          </button>
        ) : null}
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="gb-empty">Loading...</div>
        ) : visibleTopics.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox" className="gb-checkbox" checked={allVisibleChecked} onChange={toggleCheckAll} />
                  </th>
                  <th style={{ width: '14%' }}>Industry</th>
                  <th style={{ width: 90 }}>Period</th>
                  <th>Question</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleTopics.map((t) => {
                  const isEditing = editingId === t._id;
                  return (
                    <tr key={t._id}>
                      <td>
                        <input type="checkbox" className="gb-checkbox" checked={checkedIds.has(t._id)} onChange={() => toggleChecked(t._id)} />
                      </td>
                      {isEditing ? (
                        <>
                          <td>
                            <input className="gb-input" value={editIndustry} onChange={(e) => setEditIndustry(e.target.value)} />
                          </td>
                          <td>
                            <select className="gb-input" value={editPeriod} onChange={(e) => setEditPeriod(e.target.value as Period)}>
                              <option value="week">Weekly</option>
                              <option value="month">Monthly</option>
                            </select>
                          </td>
                          <td>
                            <input className="gb-input" value={editText} onChange={(e) => setEditText(e.target.value)} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="gb-link" onClick={() => saveEdit(t._id)} disabled={savingEdit}>
                                {savingEdit ? 'Saving...' : 'Save'}
                              </button>
                              <button className="gb-link" onClick={() => setEditingId(null)}>
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{t.industry}</td>
                          <td>
                            <span className="gb-badge neutral">{t.period === 'week' ? 'Weekly' : 'Monthly'}</span>
                          </td>
                          <td>{t.text}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="gb-link" onClick={() => startEdit(t)}>
                                Edit
                              </button>
                              <button className="gb-link danger" onClick={() => setDeleteTargets([t])}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gb-empty">
            <strong>No trending topics yet</strong>
            Use the form above to add your first list.
          </div>
        )}
      </div>

      {deleteTargets ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTargets(null)}>
          <div className="gb-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>
                  Delete {deleteTargets.length} topic{deleteTargets.length === 1 ? '' : 's'}?
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>This cannot be undone.</p>
              </div>
              <button className="gb-modal-close" onClick={() => setDeleteTargets(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="gb-modal-body">
              <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
                {deleteTargets.slice(0, 10).map((t) => (
                  <li key={t._id} style={{ fontSize: 13 }}>
                    {t.text}
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
                  {deleting ? 'Deleting...' : `Delete ${deleteTargets.length} topic${deleteTargets.length === 1 ? '' : 's'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
