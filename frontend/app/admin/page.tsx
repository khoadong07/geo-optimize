'use client';

import { useEffect, useState } from 'react';
import { API, authHeader } from './admin-context';

type Project = {
  _id: string;
  name: string;
  ownerId: string;
  industry?: string;
  domain?: string;
  createdAt?: string;
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`${API}/projects`, { headers: authHeader() })
      .then((res) => res.json())
      .then(setProjects)
      .catch(() => setError('Could not load the project list.'))
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <>
      <div className="gb-page-head">
        <div>
          <p className="gb-eyebrow">System admin</p>
          <h1 className="gb-title-lg">All projects</h1>
          <p className="gb-subtitle">View and manage every project in the system, regardless of owner.</p>
        </div>
      </div>

      {error ? <div className="gb-banner error">{error}</div> : null}

      <div className="gb-stats">
        <div className="gb-stat-tile">
          <div className="gb-stat-num">{projects.length}</div>
          <div className="gb-stat-label">Projects</div>
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
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.name}</td>
                    <td>{project.industry || <span className="gb-mono">—</span>}</td>
                    <td className="gb-mono">{project.ownerId}</td>
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
