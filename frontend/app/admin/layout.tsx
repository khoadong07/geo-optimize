'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ChangePasswordForm from '../ChangePasswordForm';
import { AdminSession, AdminSessionContext, API, authHeader } from './admin-context';

const NAV_ITEMS = [
  { href: '/admin', label: 'Projects' },
  { href: '/admin/users', label: 'Users' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [status, setStatus] = useState<'checking' | 'ready' | 'denied' | 'must-change-password'>('checking');
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? window.localStorage.getItem('geo_token') : null;
    if (!storedToken) {
      router.replace('/');
      return;
    }
    setToken(storedToken);
    fetch(`${API}/auth/me`, { headers: authHeader() })
      .then((res) => {
        if (!res.ok) throw new Error('unauthorized');
        return res.json();
      })
      .then((me) => {
        if (me.mustChangePassword) {
          setStatus('must-change-password');
          return;
        }
        if (me.role !== 'admin') {
          router.replace('/');
          setStatus('denied');
          return;
        }
        setSession({ username: me.username, role: me.role });
        setStatus('ready');
      })
      .catch(() => {
        window.localStorage.removeItem('geo_token');
        router.replace('/');
        setStatus('denied');
      });
  }, [router]);

  function handleLogout() {
    window.localStorage.removeItem('geo_token');
    router.replace('/');
  }

  if (status === 'must-change-password') {
    return (
      <ChangePasswordForm
        token={token}
        onSuccess={(result) => {
          window.localStorage.setItem('geo_token', result.token);
          setSession({ username: result.user.username, role: result.user.role });
          setStatus('ready');
        }}
      />
    );
  }

  if (status !== 'ready' || !session) {
    return (
      <div className="gb-shell">
        <div className="gb-content">
          <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Verifying admin session...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminSessionContext.Provider value={session}>
      <div className="gb-shell">
        <aside className="gb-sidebar">
          <div>
            <div className="gb-brand">GeoBase</div>
            <div className="gb-brand-sub">
              <span className="gb-live-dot pulse" aria-hidden="true" />
              Admin console
            </div>
          </div>

          <nav className="gb-nav">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className={`gb-nav-link${pathname === item.href ? ' active' : ''}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="gb-sidebar-footer">
            <div>
              <div style={{ color: 'var(--text)' }}>{session.username}</div>
              <span className="gb-role-badge admin">admin</span>
            </div>
            <button className="gb-btn gb-btn-ghost" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </aside>

        <main className="gb-main">
          <div className="gb-content">{children}</div>
        </main>
      </div>
    </AdminSessionContext.Provider>
  );
}
