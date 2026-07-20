'use client';

import { FormEvent, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ChangePasswordResult = {
  token: string;
  user: { id: string; username: string; role: 'admin' | 'user'; mustChangePassword: boolean };
};

export default function ChangePasswordForm({
  token,
  onSuccess,
}: {
  token: string;
  onSuccess: (result: ChangePasswordResult) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    const res = await fetch(`${API}/auth/change-password`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || 'Could not change password.');
      return;
    }
    onSuccess(data);
  }

  return (
    <div className="gb-auth-wrap">
      <div className="gb-auth-card">
        <h1>Change your password</h1>
        <p>Your account is using a default password. Set a new one before continuing.</p>
        <form onSubmit={handleSubmit} className="gb-form-row">
          <label className="gb-label">
            Current password
            <input
              className="gb-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label className="gb-label">
            New password
            <input
              className="gb-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          <label className="gb-label">
            Confirm new password
            <input
              className="gb-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {error ? <div className="gb-banner error">{error}</div> : null}
          <button className="gb-btn gb-btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}
