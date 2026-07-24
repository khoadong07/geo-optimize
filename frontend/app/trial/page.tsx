'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { industryLabel } from '../industry';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Project = {
  _id: string;
  name: string;
  description?: string;
  industry?: string;
};

export default function TrialPickerPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      window.localStorage.setItem('geo_token', urlToken);
      window.history.replaceState({}, '', '/trial');
    }

    const token = window.localStorage.getItem('geo_token');
    if (!token) {
      router.replace('/');
      return;
    }
    fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json();
      })
      .then((data) => {
        setProjects(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [router]);

  if (status === 'checking') {
    return (
      <div className="gb-auth-wrap">
        <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading sample projects...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="gb-auth-wrap">
        <div className="gb-auth-card">
          <p className="gb-eyebrow">GeoBase</p>
          <h1>Your preview expired</h1>
          <p>Submit the trial form again to get a fresh preview link.</p>
          <button className="gb-btn gb-btn-primary" onClick={() => router.push('/')}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="gb-container">
      <div className="gb-header plain">
        <div>
          <p className="gb-eyebrow">GeoBase trial</p>
          <h1 className="gb-title-lg">Pick a sample dashboard</h1>
          <p className="gb-subtitle">Browse ready-made brand dashboards across industries — click one to explore it live.</p>
        </div>
      </div>

      {projects.length ? (
        <div className="gb-project-grid">
          {projects.map((project) => (
            <button key={project._id} className="gb-project-card" onClick={() => router.push(`/projects/${project._id}`)}>
              <div>
                <h3 className="gb-project-name">{project.name}</h3>
                <div style={{ color: 'var(--text-faint)', fontSize: 12 }}>{project.description || 'GEO tracking sample.'}</div>
              </div>
              <span className="gb-badge neutral">{industryLabel(project.industry) || 'Uncategorized'}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="gb-card gb-empty">
          <strong>No sample dashboards yet</strong>
          Check back shortly — we&apos;re preparing sample dashboards to preview.
        </div>
      )}
    </main>
  );
}
