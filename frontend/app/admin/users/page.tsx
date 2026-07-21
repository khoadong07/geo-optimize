'use client';

import { FormEvent, useEffect, useState } from 'react';
import { API, authHeader, useAdminSession } from '../admin-context';

type User = {
  _id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt?: string;
};

export default function AdminUsersPage() {
  const session = useAdminSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [creating, setCreating] = useState(false);

  function loadUsers() {
    return fetch(`${API}/users`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setUsers);
  }

  useEffect(() => {
    loadUsers()
      .catch(() => setError('Could not load the user list.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    setCreated(null);
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, role }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.message || 'Could not create account.');
      return;
    }
    setCreated({ username: data.username, password: data.password });
    setUsername('');
    setRole('user');
    loadUsers();
  }

  async function handleRoleChange(user: User, nextRole: 'admin' | 'user') {
    setError('');
    const res = await fetch(`${API}/users/${user._id}/role`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: nextRole }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not change role.');
      return;
    }
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u)));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`${API}/users/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader() });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not delete account.');
      setDeleteTarget(null);
      return;
    }
    setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
    setDeleteTarget(null);
  }

  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">Users</h1>
          <p className="gb-subtitle">Grant admin access, create new accounts, or revoke access.</p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}
      {created ? (
        <div className="gb-banner info">
          Created account <b>{created.username}</b> — password <code className="gb-mono" style={{ background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>{created.password}</code>.
          Share this now; it won&apos;t be shown again. They must change it on first sign-in.
        </div>
      ) : null}

      <div className="gb-stats">
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{users.length}</div>
          <div className="gb-stat-label">Total accounts</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{adminCount}</div>
          <div className="gb-stat-label">Admins</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{users.length - adminCount}</div>
          <div className="gb-stat-label">Regular users</div>
        </div>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        <form className="gb-inline-form" onSubmit={handleCreate}>
          <div>
            <label htmlFor="new-username" style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>
              Username
            </label>
            <input id="new-username" className="gb-input" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} required />
          </div>
          <div>
            <label htmlFor="new-role" style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>
              Role
            </label>
            <select id="new-role" className="gb-input" value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'user')}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', fontSize: 11.5, color: 'var(--text-faint)', alignSelf: 'center' }}>
            New accounts get a random 8-character password, shown once above, and must change it on first sign-in.
          </div>
          <button className="gb-btn gb-btn-primary" type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create account'}
          </button>
        </form>

        {loading ? (
          <div className="gb-empty">Loading...</div>
        ) : users.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user.username === session.username;
                  return (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>
                        {isSelf ? (
                          <span className={`gb-role-badge ${user.role}`}>{user.role}</span>
                        ) : (
                          <select
                            className="gb-input"
                            style={{ width: 'auto', padding: '5px 10px', fontSize: 12.5 }}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value as 'admin' | 'user')}
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                      <td className="gb-mono">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</td>
                      <td>
                        <button
                          className="gb-link danger"
                          onClick={() => setDeleteTarget(user)}
                          disabled={isSelf}
                          title={isSelf ? 'You cannot delete the account you are signed in as' : undefined}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="gb-empty">
            <strong>No other accounts yet</strong>
            Use the form above to create one.
          </div>
        )}
      </div>

      {deleteTarget ? (
        <div className="gb-modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="gb-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-modal-head">
              <div>
                <h3>Delete &quot;{deleteTarget.username}&quot;?</h3>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>They will lose access immediately.</p>
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
                  {deleting ? 'Deleting...' : 'Delete account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
