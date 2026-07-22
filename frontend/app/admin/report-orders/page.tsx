'use client';

import { useEffect, useState } from 'react';
import { API, authHeader } from '../admin-context';

type ReportOrder = {
  _id: string;
  reportId: string;
  reportTitle: string;
  priceVnd: number;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'contacted' | 'fulfilled';
  createdAt: string;
};

export default function AdminReportOrdersPage() {
  const [orders, setOrders] = useState<ReportOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ReportOrder | null>(null);
  const [deleting, setDeleting] = useState(false);

  function loadOrders() {
    return fetch(`${API}/report-orders`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setOrders);
  }

  useEffect(() => {
    loadOrders()
      .catch(() => setError('Could not load report orders.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(order: ReportOrder, status: ReportOrder['status']) {
    setError('');
    const res = await fetch(`${API}/report-orders/${order._id}/status`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not update status.');
      return;
    }
    setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status } : o)));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`${API}/report-orders/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader() });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not delete order.');
      setDeleteTarget(null);
      return;
    }
    setOrders((prev) => prev.filter((o) => o._id !== deleteTarget._id));
    setDeleteTarget(null);
  }

  const newCount = orders.filter((o) => o.status === 'new').length;

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">Report orders</h1>
          <p className="gb-subtitle">
            Purchase requests for paid reports. No payment gateway is wired up yet — follow up manually by email with a payment link, then send
            the file once paid.
          </p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}

      <div className="gb-stats">
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{orders.length}</div>
          <div className="gb-stat-label">Total orders</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{newCount}</div>
          <div className="gb-stat-label">Awaiting follow-up</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{orders.filter((o) => o.status === 'fulfilled').length}</div>
          <div className="gb-stat-label">Fulfilled</div>
        </div>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="gb-empty">Loading...</div>
        ) : orders.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Price</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>{o.reportTitle}</td>
                    <td className="gb-mono">{o.priceVnd.toLocaleString('vi-VN')}₫</td>
                    <td>{o.name}</td>
                    <td className="gb-mono">{o.email}</td>
                    <td>{o.company || '—'}</td>
                    <td>
                      <select
                        className="gb-input"
                        style={{ width: 'auto', padding: '5px 10px', fontSize: 12.5 }}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value as ReportOrder['status'])}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="fulfilled">Fulfilled</option>
                      </select>
                    </td>
                    <td className="gb-mono">{new Date(o.createdAt).toLocaleString()}</td>
                    <td>
                      <button className="gb-link danger" onClick={() => setDeleteTarget(o)}>
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
            <strong>No report orders yet</strong>
            Purchase requests from the Reports section will show up here.
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="gb-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>Delete order from &quot;{deleteTarget.name}&quot;?</h3>
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
                  {deleting ? 'Deleting...' : 'Delete order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
