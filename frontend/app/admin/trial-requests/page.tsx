'use client';

import { useEffect, useState } from 'react';
import { API, authHeader } from '../admin-context';

type TrialRequest = {
  _id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: 'new' | 'contacted' | 'converted';
  accountUsername: string;
  welcomeEmailSent: boolean;
  createdAt: string;
};

export default function AdminTrialRequestsPage() {
  const [requests, setRequests] = useState<TrialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TrialRequest | null>(null);
  const [deleting, setDeleting] = useState(false);

  function loadRequests() {
    return fetch(`${API}/trial-requests`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setRequests);
  }

  useEffect(() => {
    loadRequests()
      .catch(() => setError('Could not load trial requests.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(request: TrialRequest, status: TrialRequest['status']) {
    setError('');
    const res = await fetch(`${API}/trial-requests/${request._id}/status`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not update status.');
      return;
    }
    setRequests((prev) => prev.map((r) => (r._id === request._id ? { ...r, status } : r)));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`${API}/trial-requests/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader() });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not delete request.');
      setDeleteTarget(null);
      return;
    }
    setRequests((prev) => prev.filter((r) => r._id !== deleteTarget._id));
    setDeleteTarget(null);
  }

  const newCount = requests.filter((r) => r.status === 'new').length;

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">Trial requests</h1>
          <p className="gb-subtitle">
            Leads submitted from the marketing site&apos;s trial form. An account is created and emailed automatically on submission.
          </p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}

      <div className="gb-stats">
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{requests.length}</div>
          <div className="gb-stat-label">Total requests</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{newCount}</div>
          <div className="gb-stat-label">Awaiting follow-up</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{requests.filter((r) => r.status === 'converted').length}</div>
          <div className="gb-stat-label">Converted</div>
        </div>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="gb-empty">Loading...</div>
        ) : requests.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Account</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id}>
                    <td>{r.name}</td>
                    <td className="gb-mono">{r.email}</td>
                    <td style={{ maxWidth: 200 }}>
                      <div>{r.company}</div>
                      {r.message ? <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>{r.message}</div> : null}
                    </td>
                    <td>
                      <div className="gb-mono">{r.accountUsername || '—'}</div>
                      <span className={`gb-badge ${r.welcomeEmailSent ? 'ok' : 'bad'}`} style={{ marginTop: 4 }}>
                        {r.welcomeEmailSent ? 'Email sent' : 'Email failed'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="gb-input"
                        style={{ width: 'auto', padding: '5px 10px', fontSize: 12.5 }}
                        value={r.status}
                        onChange={(e) => handleStatusChange(r, e.target.value as TrialRequest['status'])}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="gb-mono">{new Date(r.createdAt).toLocaleString()}</td>
                    <td>
                      <button className="gb-link danger" onClick={() => setDeleteTarget(r)}>
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
            <strong>No trial requests yet</strong>
            Submissions from the marketing site&apos;s trial form will show up here.
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="gb-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>Delete request from &quot;{deleteTarget.name}&quot;?</h3>
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
                  {deleting ? 'Deleting...' : 'Delete request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
