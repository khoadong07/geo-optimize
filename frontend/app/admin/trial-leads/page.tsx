'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API, authHeader } from '../admin-context';

type TrialLead = {
  _id: string;
  projectId: string;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'converted';
  previewEmailSent: boolean;
  createdAt: string;
};

export default function AdminTrialLeadsPage() {
  const [leads, setLeads] = useState<TrialLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TrialLead | null>(null);
  const [deleting, setDeleting] = useState(false);

  function loadLeads() {
    return fetch(`${API}/trial/leads`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setLeads);
  }

  useEffect(() => {
    loadLeads()
      .catch(() => setError('Could not load trial leads.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(lead: TrialLead, status: TrialLead['status']) {
    setError('');
    const res = await fetch(`${API}/trial/leads/${lead._id}/status`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not update status.');
      return;
    }
    setLeads((prev) => prev.map((l) => (l._id === lead._id ? { ...l, status } : l)));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`${API}/trial/leads/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader() });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not delete lead.');
      setDeleteTarget(null);
      return;
    }
    setLeads((prev) => prev.filter((l) => l._id !== deleteTarget._id));
    setDeleteTarget(null);
  }

  const newCount = leads.filter((l) => l.status === 'new').length;

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">Trial leads</h1>
          <p className="gb-subtitle">
            Visitors who ran the self-service trial analysis and submitted their details after the preview. Click a project
            to see their full generated report.
          </p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}

      <div className="gb-stats">
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{leads.length}</div>
          <div className="gb-stat-label">Total leads</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{newCount}</div>
          <div className="gb-stat-label">Awaiting follow-up</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{leads.filter((l) => l.status === 'converted').length}</div>
          <div className="gb-stat-label">Converted</div>
        </div>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="gb-empty">Loading...</div>
        ) : leads.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Project</th>
                  <th>Preview email</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id}>
                    <td>{l.name}</td>
                    <td className="gb-mono">{l.email}</td>
                    <td>{l.company || '—'}</td>
                    <td>
                      <Link className="gb-link" href={`/projects/${l.projectId}`}>
                        View report
                      </Link>
                    </td>
                    <td>
                      <span className={`gb-badge ${l.previewEmailSent ? 'ok' : 'bad'}`}>{l.previewEmailSent ? 'Sent' : 'Failed'}</span>
                    </td>
                    <td>
                      <select
                        className="gb-input"
                        style={{ width: 'auto', padding: '5px 10px', fontSize: 12.5 }}
                        value={l.status}
                        onChange={(e) => handleStatusChange(l, e.target.value as TrialLead['status'])}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="gb-mono">{new Date(l.createdAt).toLocaleString()}</td>
                    <td>
                      <button className="gb-link danger" onClick={() => setDeleteTarget(l)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gb-empty">
            <strong>No trial leads yet</strong>
            Visitors who submit their details after previewing a trial report will show up here.
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="gb-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>Delete lead from &quot;{deleteTarget.name}&quot;?</h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>This cannot be undone.</p>
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
                  {deleting ? 'Deleting...' : 'Delete lead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
