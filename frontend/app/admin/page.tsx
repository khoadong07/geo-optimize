'use client';

import { FormEvent, useEffect, useState } from 'react';
import { industryLabel, PROJECT_INDUSTRIES } from '../industry';
import { Zone, ZONE_OPTIONS } from '../zones';
import { API, authHeader } from './admin-context';

type Project = {
  _id: string;
  name: string;
  ownerId: string;
  industry?: string;
  domain?: string;
  visibility?: 'private' | 'sample';
  createdAt?: string;
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [newName, setNewName] = useState('');
  const [newZone, setNewZone] = useState<Zone>('vietnam');
  const [newIndustry, setNewIndustry] = useState(PROJECT_INDUSTRIES[0]);
  const [creating, setCreating] = useState(false);

  function loadProjects() {
    return fetch(`${API}/projects`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setProjects);
  }

  useEffect(() => {
    loadProjects()
      .catch(() => setError('Could not load the project list.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateSample(e: FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError('');
    const res = await fetch(`${API}/projects`, {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, zone: newZone, industry: newIndustry, visibility: 'sample' }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      setError(data.message || 'Could not create sample project.');
      return;
    }
    setNewName('');
    loadProjects();
  }

  async function handleToggleVisibility(project: Project) {
    setError('');
    const nextVisibility = project.visibility === 'sample' ? 'private' : 'sample';
    const res = await fetch(`${API}/projects/${project._id}`, {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: nextVisibility }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not update visibility.');
      return;
    }
    setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, visibility: nextVisibility } : p)));
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`${API}/projects/${deleteTarget._id}`, { method: 'DELETE', headers: authHeader() });
    setDeleting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Could not delete project.');
      setDeleteTarget(null);
      return;
    }
    setProjects((prev) => prev.filter((p) => p._id !== deleteTarget._id));
    setDeleteTarget(null);
  }

  const ownerCount = new Set(projects.map((p) => p.ownerId)).size;
  const industryCount = new Set(projects.map((p) => p.industry).filter(Boolean)).size;
  const sampleCount = projects.filter((p) => p.visibility === 'sample').length;

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">All projects</h1>
          <p className="gb-subtitle">
            View and manage every project in the system, regardless of owner. Mark a project &quot;Sample&quot; to make it
            available in the trial preview picker at <code className="gb-mono">/trial</code>.
          </p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}

      <div className="gb-stats">
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{projects.length}</div>
          <div className="gb-stat-label">Projects</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{sampleCount}</div>
          <div className="gb-stat-label">Sample (trial-visible)</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{ownerCount}</div>
          <div className="gb-stat-label">Owners</div>
        </div>
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{industryCount}</div>
          <div className="gb-stat-label">Industries tracked</div>
        </div>
      </div>

      <div className="gb-card" style={{ padding: 0 }}>
        <form className="gb-inline-form" onSubmit={handleCreateSample}>
          <div>
            <label htmlFor="new-project-name" style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>
              Name
            </label>
            <input id="new-project-name" className="gb-input" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Acme" />
          </div>
          <div>
            <label htmlFor="new-project-zone" style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>
              Market
            </label>
            <select id="new-project-zone" className="gb-input" value={newZone} onChange={(e) => setNewZone(e.target.value as Zone)}>
              {ZONE_OPTIONS.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.flag} {z.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-project-industry" style={{ display: 'block', fontSize: 12, color: 'var(--text-faint)', marginBottom: 6 }}>
              Industry
            </label>
            <select id="new-project-industry" className="gb-input" value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)}>
              {PROJECT_INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industryLabel(industry, 'vi')}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', fontSize: 11.5, color: 'var(--text-faint)', alignSelf: 'center' }}>
            Created as a sample project — add prompts and trigger runs afterward so it has real data to show.
          </div>
          <button className="gb-btn gb-btn-primary" type="submit" disabled={creating}>
            {creating ? 'Creating...' : '+ New sample project'}
          </button>
        </form>

        {loading ? (
          <div className="gb-empty">Loading...</div>
        ) : projects.length ? (
          <div className="gb-table-wrap">
            <table className="gb-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Industry</th>
                  <th>Owner ID</th>
                  <th>Visibility</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.name}</td>
                    <td>{industryLabel(project.industry) || <span className="gb-mono">—</span>}</td>
                    <td className="gb-mono">{project.ownerId}</td>
                    <td>
                      <button
                        className={`gb-badge ${project.visibility === 'sample' ? 'ok' : 'neutral'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => handleToggleVisibility(project)}
                      >
                        {project.visibility === 'sample' ? 'Sample' : 'Private'}
                      </button>
                    </td>
                    <td className="gb-mono">{project.createdAt ? new Date(project.createdAt).toLocaleString() : '—'}</td>
                    <td>
                      <button className="gb-link danger" onClick={() => setDeleteTarget(project)}>
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
            <strong>No projects yet</strong>
            Once users create projects, they will show up here.
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
                  Every prompt inside this project will be lost too. This cannot be undone.
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
                  {deleting ? 'Deleting...' : 'Delete project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
