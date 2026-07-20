'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { IconAgent, IconAmplify, IconGap, IconOverview, IconRanking, IconSentiment, IconTarget } from './icons';
import { industryLabel } from '../../industry';
import { API, authHeader, brandInitials, Project, ProjectContext } from './project-context';

const NAV_ITEMS = [
  { href: '', label: 'Overview', icon: IconOverview, section: 'Project' },
  { href: '/prompts', label: 'Ranking & Prompts', icon: IconRanking, section: 'Project' },
  { href: '/sentiment', label: 'Sentiment', icon: IconSentiment, section: 'Project' },
  { href: '/gap-citation', label: 'Gap & Citation', icon: IconGap, section: 'Project' },
  { href: '/amplify', label: 'Amplify', icon: IconAmplify, section: 'Project' },
  { href: '/ai-agent', label: 'AI Agent', icon: IconAgent, section: 'Project' },
  { href: '/target', label: 'Target Position', icon: IconTarget, section: 'Configuration' },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  const load = useCallback(() => {
    const token = window.localStorage.getItem('geo_token');
    if (!token) {
      router.replace('/');
      return;
    }
    fetch(`${API}/auth/me`, { headers: authHeader() })
      .then((res) => {
        if (!res.ok) throw new Error('unauthorized');
        return res.json();
      })
      .then((me) => {
        setUsername(me.username);
        return fetch(`${API}/projects/${projectId}`, { headers: authHeader() });
      })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Could not load project');
        }
        return res.json();
      })
      .then((data) => {
        setProject(data);
        setStatus('ready');
      })
      .catch((err) => {
        setError(err.message === 'unauthorized' ? '' : err.message || 'Could not load project');
        if (err.message === 'unauthorized') {
          window.localStorage.removeItem('geo_token');
          router.replace('/');
          return;
        }
        setStatus('error');
      });
  }, [projectId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const basePath = `/projects/${projectId}`;
  const activeHref = pathname === basePath ? '' : pathname.slice(basePath.length);

  if (status === 'checking') {
    return (
      <div className="gb-shell">
        <div className="gb-content">
          <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (status === 'error' || !project) {
    return (
      <div className="gb-shell">
        <div className="gb-content">
          <div className="gb-banner error">{error || 'Could not load project.'}</div>
          <button className="gb-btn gb-btn-ghost" onClick={() => router.push('/')}>
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={{ project, refresh: load }}>
      <div className="gb-shell">
        <aside className="gb-sidebar">
          <div className="gb-brand">
            <span className="gb-live-dot pulse" aria-hidden="true" />
            GeoBase
          </div>

          <button className="gb-btn gb-btn-ghost" style={{ width: '100%' }} onClick={() => router.push('/')}>
            All projects
          </button>

          <div>
            <div className="gb-nav-section">Project</div>
            <nav className="gb-nav">
              {NAV_ITEMS.filter((i) => i.section === 'Project').map((item) => (
                <Link key={item.href} href={`${basePath}${item.href}`} className={`gb-nav-link${activeHref === item.href ? ' active' : ''}`}>
                  <item.icon />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="gb-nav-section">Configuration</div>
            <nav className="gb-nav">
              {NAV_ITEMS.filter((i) => i.section === 'Configuration').map((item) => (
                <Link key={item.href} href={`${basePath}${item.href}`} className={`gb-nav-link${activeHref === item.href ? ' active' : ''}`}>
                  <item.icon />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="gb-sidebar-footer">
            <div style={{ color: 'var(--text)' }}>{username}</div>
            <button
              className="gb-btn gb-btn-ghost"
              onClick={() => {
                window.localStorage.removeItem('geo_token');
                router.replace('/');
              }}
            >
              Sign out
            </button>
          </div>
        </aside>

        <div className="gb-main">
          <header className="gb-header">
            <div className="gb-brandpill">
              <div className="gb-brand-badge">{brandInitials(project.name)}</div>
              <div>
                <div className="gb-brand-name">{project.name}</div>
                <div className="gb-brand-meta">{industryLabel(project.industry) || 'Uncategorized'}</div>
              </div>
            </div>
            <div className="gb-header-right">
              <span className="gb-pill">
                Competitors {project.competitors.length ? `· ${project.competitors.join(' · ')}` : '· none set'}
              </span>
              <span className="gb-pill">Window · last 14 days</span>
              <Link href={`${basePath}/prompts`} className="gb-btn gb-btn-primary">
                + New prompt
              </Link>
            </div>
          </header>

          <div className="gb-content">{children}</div>
        </div>
      </div>
    </ProjectContext.Provider>
  );
}
