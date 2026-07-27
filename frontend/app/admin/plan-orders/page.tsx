'use client';

import { useEffect, useState } from 'react';
import { API, authHeader } from '../admin-context';

type PlanOrder = {
  _id: string;
  orderNumber: number;
  planSlug: string;
  planName: string;
  priceVnd: number;
  totalVnd: number;
  name: string;
  email: string;
  company: string;
  status: 'new' | 'paid' | 'contacted' | 'fulfilled';
  createdAt: string;
};

export default function AdminPlanOrdersPage() {
  const [orders, setOrders] = useState<PlanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PlanOrder | null>(null);
  const [deleting, setDeleting] = useState(false);

  function loadOrders() {
    return fetch(`${API}/plan-orders`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setOrders);
  }

  useEffect(() => {
    loadOrders()
      .catch(() => setError('Could not load plan orders.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(order: PlanOrder, status: PlanOrder['status']) {
    setError('');
    const res = await fetch(`${API}/plan-orders/${order._id}/status`, {
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
    const res = await fetch(`${API}/plan-orders/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader() });
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
          <h1 className="gb-title-lg">Plan orders</h1>
          <p className="gb-subtitle">
            Subscription purchase requests from the pricing checkout (including the trial report&apos;s upgrade CTA). Buyers pay
            via the QR checkout flow (currently a simulated demo payment) — once paid, create/activate their account manually
            from Users.
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
                  <th>#</th>
                  <th>Plan</th>
                  <th>Total</th>
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
                    <td className="gb-mono">#{o.orderNumber}</td>
                    <td>{o.planName}</td>
                    <td className="gb-mono">{o.totalVnd.toLocaleString('vi-VN')}₫</td>
                    <td className="gb-mono">{o.email}</td>
                    <td>{o.company || '—'}</td>
                    <td>
                      <select
                        className="gb-input"
                        style={{ width: 'auto', padding: '5px 10px', fontSize: 12.5 }}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value as PlanOrder['status'])}
                      >
                        <option value="new">New</option>
                        <option value="paid">Paid</option>
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
            <strong>No plan orders yet</strong>
            Purchase requests from the pricing checkout will show up here.
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="gb-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>Delete order from &quot;{deleteTarget.email}&quot;?</h3>
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
