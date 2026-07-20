'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChangePasswordForm from './ChangePasswordForm';
import { industryLabel } from './industry';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Project = {
  _id: string;
  name: string;
  description?: string;
  industry?: string;
  domain?: string;
};

const INDUSTRY_OPTIONS = ['Banking'];

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pendingPasswordChange, setPendingPasswordChange] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState(INDUSTRY_OPTIONS[0]);
  const [newCompetitors, setNewCompetitors] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  function loadProjects(token: string) {
    return fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setIsAuthenticated(true);
      });
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('geo_token') : null;
    if (!token) {
      setCheckingSession(false);
      return;
    }
    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('invalid session');
        return res.json();
      })
      .then((me) => {
        if (me.mustChangePassword) {
          setPendingPasswordChange(token);
          return;
        }
        if (me.role === 'admin') {
          router.replace('/admin');
          return;
        }
        return loadProjects(token);
      })
      .catch(() => {
        window.localStorage.removeItem('geo_token');
        setIsAuthenticated(false);
      })
      .finally(() => setCheckingSession(false));
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.message || 'Login failed.');
      return;
    }
    window.localStorage.setItem('geo_token', data.token);
    if (data.user.mustChangePassword) {
      setPendingPasswordChange(data.token);
      return;
    }
    if (data.user.role === 'admin') {
      router.replace('/admin');
      return;
    }
    await loadProjects(data.token);
  }

  function handleLogout() {
    window.localStorage.removeItem('geo_token');
    setIsAuthenticated(false);
    setProjects([]);
  }

  function handleOpenDashboard(project: Project) {
    router.push(`/projects/${project._id}`);
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    const token = window.localStorage.getItem('geo_token');
    const competitors = newCompetitors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const res = await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, industry: newIndustry || undefined, competitors }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setCreateError(data.message || 'Could not create project.');
      return;
    }
    setNewName('');
    setNewIndustry('');
    setNewCompetitors('');
    setShowCreateForm(false);
    router.push(`/projects/${data._id}`);
  }

  if (checkingSession) {
    return (
      <div className="gb-auth-wrap">
        <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Checking session...</p>
      </div>
    );
  }

  if (pendingPasswordChange) {
    return (
      <ChangePasswordForm
        token={pendingPasswordChange}
        onSuccess={(result) => {
          window.localStorage.setItem('geo_token', result.token);
          setPendingPasswordChange(null);
          if (result.user.role === 'admin') {
            router.replace('/admin');
            return;
          }
          loadProjects(result.token);
        }}
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="gb-auth-wrap">
        <div className="gb-auth-card">
          <p className="gb-eyebrow">GeoBase</p>
          <h1>Sign in</h1>
          <p>Track brand visibility across AI answer engines.</p>
          <form onSubmit={handleLogin} className="gb-form-row">
            <label className="gb-label">
              Username
              <input className="gb-input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <label className="gb-label">
              Password
              <input className="gb-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            {error ? <div className="gb-banner error">{error}</div> : null}
            <button className="gb-btn gb-btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="gb-container">
      <div className="gb-header plain">
        <div>
          <p className="gb-eyebrow">GeoBase</p>
          <h1 className="gb-title-lg">Projects</h1>
          <p className="gb-subtitle">Pick a project to open its analytics dashboard, or create a new one.</p>
        </div>
        <div className="gb-header-right">
          <button className="gb-btn gb-btn-primary" onClick={() => setShowCreateForm((v) => !v)}>
            {showCreateForm ? 'Close' : '+ New project'}
          </button>
          <button className="gb-btn gb-btn-ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>

      {showCreateForm ? (
        <div className="gb-card" style={{ marginBottom: 20, maxWidth: 480 }}>
          <h2>New project</h2>
          <p className="gb-card-sub">Enter the brand details to start tracking its GEO visibility.</p>
          <form onSubmit={handleCreateProject}>
            <div className="gb-field">Brand name</div>
            <input className="gb-input" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Acme" />

            <div className="gb-field">Industry</div>
            <select className="gb-input" value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)}>
              {INDUSTRY_OPTIONS.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            <div className="gb-field">Competitors (comma-separated, optional)</div>
            <input className="gb-input" value={newCompetitors} onChange={(e) => setNewCompetitors(e.target.value)} placeholder="Competitor A, Competitor B" />

            {createError ? <div className="gb-banner error" style={{ marginTop: 14 }}>{createError}</div> : null}

            <div style={{ marginTop: 16 }}>
              <button className="gb-btn gb-btn-primary" type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create project'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {projects.length ? (
        <div className="gb-project-grid">
          {projects.map((project) => (
            <button key={project._id} className="gb-project-card" onClick={() => handleOpenDashboard(project)}>
              <div>
                <h3 className="gb-project-name">{project.name}</h3>
                <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>{project.description || 'GEO tracking ready to run.'}</div>
              </div>
              <span className="gb-badge neutral">{industryLabel(project.industry) || 'Uncategorized'}</span>
            </button>
          ))}
        </div>
      ) : !showCreateForm ? (
        <div className="gb-card gb-empty">
          <strong>No projects yet</strong>
          Use &quot;+ New project&quot; above to start tracking your first brand.
        </div>
      ) : null}
    </main>
  );
}
