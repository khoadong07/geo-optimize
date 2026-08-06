'use client';

import { FormEvent, useEffect, useState } from 'react';
import { API, authHeader } from '../admin-context';

type Industry = {
  _id: string;
  name: string;
  labelEn: string;
  labelVi: string;
  order: number;
};

export default function AdminIndustriesPage() {
  const [industries, setIndustries] = useState<Industry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Industry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [newName, setNewName] = useState('');
  const [newLabelEn, setNewLabelEn] = useState('');
  const [newLabelVi, setNewLabelVi] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLabelEn, setEditLabelEn] = useState('');
  const [editLabelVi, setEditLabelVi] = useState('');
  const [editOrder, setEditOrder] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  function load() {
    return fetch(`${API}/industries`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setIndustries);
  }

  useEffect(() => {
    load()
      .catch(() => setError('Could not load industries.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    const res = await fetch(`${API}/industries`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), labelEn: newLabelEn.trim(), labelVi: newLabelVi.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      setError(data.message || 'Could not create industry.');
      return;
    }
    setSuccess(`Created "${newName.trim()}".`);
    setNewName('');
    setNewLabelEn('');
    setNewLabelVi('');
    load();
  }

  function startEdit(industry: Industry) {
    setEditingId(industry._id);
    setEditName(industry.name);
    setEditLabelEn(industry.labelEn);
    setEditLabelVi(industry.labelVi);
    setEditOrder(industry.order);
    setError('');
    setSuccess('');
  }

  async function saveEdit(id: string) {
    setSavingEdit(true);
    setError('');
    const res = await fetch(`${API}/industries/${id}`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), labelEn: editLabelEn.trim(), labelVi: editLabelVi.trim(), order: editOrder }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingEdit(false);
    if (!res.ok) {
      setError(data.message || 'Could not update industry.');
      return;
    }
    setEditingId(null);
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`${API}/industries/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader() });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not delete industry.');
      setDeleteTarget(null);
      return;
    }
    setIndustries((prev) => (prev || []).filter((i) => i._id !== deleteTarget._id));
    setDeleteTarget(null);
  }

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">Industries</h1>
          <p className="gb-subtitle">
            The catalog of industries used across project creation, the trial setup step, and AI industry detection.
            &quot;Order&quot; controls where each one appears in dropdowns.
          </p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}
      {success ? <div className="gb-banner info">{success}</div> : null}

      <div className="gb-stats">
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{industries?.length ?? 0}</div>
          <div className="gb-stat-label">Industries</div>
        </div>
      </div>

      <div className="gb-card" style={{ marginBottom: 20 }}>
        <h2>Add industry</h2>
        <form className="gb-inline-form" onSubmit={handleCreate}>
          <div>
            <label htmlFor="new-industry-name" style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>
              Name (canonical value)
            </label>
            <input id="new-industry-name" className="gb-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Aviation" required />
          </div>
          <div>
            <label htmlFor="new-industry-en" style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>
              English label
            </label>
            <input id="new-industry-en" className="gb-input" value={newLabelEn} onChange={(e) => setNewLabelEn(e.target.value)} placeholder="Aviation" required />
          </div>
          <div>
            <label htmlFor="new-industry-vi" style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>
              Vietnamese label
            </label>
            <input id="new-industry-vi" className="gb-input" value={newLabelVi} onChange={(e) => setNewLabelVi(e.target.value)} placeholder="Hàng không" required />
          </div>
          <button className="gb-btn gb-btn-primary" type="submit" disabled={creating}>
            {creating ? 'Creating...' : '+ Add industry'}
          </button>
        </form>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="gb-empty">Loading...</div>
        ) : industries && industries.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Order</th>
                  <th>Name</th>
                  <th>English label</th>
                  <th>Vietnamese label</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {industries.map((industry) => {
                  const isEditing = editingId === industry._id;
                  return (
                    <tr key={industry._id}>
                      {isEditing ? (
                        <>
                          <td>
                            <input
                              type="number"
                              className="gb-input"
                              style={{ width: 70 }}
                              value={editOrder}
                              onChange={(e) => setEditOrder(Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <input className="gb-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
                          </td>
                          <td>
                            <input className="gb-input" value={editLabelEn} onChange={(e) => setEditLabelEn(e.target.value)} />
                          </td>
                          <td>
                            <input className="gb-input" value={editLabelVi} onChange={(e) => setEditLabelVi(e.target.value)} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="gb-link" onClick={() => saveEdit(industry._id)} disabled={savingEdit}>
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
                          <td className="gb-mono">{industry.order}</td>
                          <td>{industry.name}</td>
                          <td>{industry.labelEn}</td>
                          <td>{industry.labelVi}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="gb-link" onClick={() => startEdit(industry)}>
                                Edit
                              </button>
                              <button className="gb-link danger" onClick={() => setDeleteTarget(industry)}>
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
            <strong>No industries yet</strong>
            Use the form above to add your first one.
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="gb-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>Delete &quot;{deleteTarget.name}&quot;?</h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
                  Existing projects already tagged with this industry keep the raw value but it will no longer appear in
                  dropdowns. This cannot be undone.
                </p>
              </div>
              <button className="gb-modal-close" onClick={() => setDeleteTarget(null)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="gb-modal-body">
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="gb-btn gb-btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  Cancel
                </button>
                <button className="gb-btn gb-btn-primary" style={{ background: 'var(--red)' }} onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete industry'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
