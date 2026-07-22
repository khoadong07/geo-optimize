'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { IconAgent, IconAmplify, IconGap, IconOverview, IconRanking, IconSentiment, IconSignOut, IconTarget } from './icons';
import { industryLabel } from '../../industry';
import { useLanguage } from '../../i18n';
import { API, authHeader, brandInitials, Project, ProjectContext } from './project-context';

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const projectId = params.projectId as string;
  const { lang, setLang, t } = useLanguage();

  const NAV_ITEMS = [
    { href: '', label: t.app.layout.navOverview, icon: IconOverview, section: 'project' as const },
    { href: '/prompts', label: t.app.layout.navPrompts, icon: IconRanking, section: 'project' as const },
    { href: '/sentiment', label: t.app.layout.navSentiment, icon: IconSentiment, section: 'project' as const },
    { href: '/gap-citation', label: t.app.layout.navGapCitation, icon: IconGap, section: 'project' as const },
    { href: '/amplify', label: t.app.layout.navAmplify, icon: IconAmplify, section: 'project' as const },
    { href: '/ai-agent', label: t.app.layout.navAiAgent, icon: IconAgent, section: 'project' as const },
    { href: '/target', label: t.app.layout.navTarget, icon: IconTarget, section: 'configuration' as const },
  ];

  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');

  const load = useCallback(() => {
    const token = window.localStorage.getItem('geo_token');
    if (!token) {
      router.replace('/login');
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
          throw new Error(data.message || 'load-failed');
        }
        return res.json();
      })
      .then((data) => {
        setProject(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.message === 'unauthorized') {
          setError('');
          window.localStorage.removeItem('geo_token');
          router.replace('/login');
          return;
        }
        setError(err.message === 'load-failed' ? t.app.layout.couldNotLoadProject : err.message);
        setStatus('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t.app.layout.loadingProject}</p>
        </div>
      </div>
    );
  }

  if (status === 'error' || !project) {
    return (
      <div className="gb-shell">
        <div className="gb-content">
          <div className="gb-banner error">{error || t.app.layout.couldNotLoadProject}</div>
          <button className="gb-btn gb-btn-ghost" onClick={() => router.push('/login')}>
            {t.app.layout.backToProjects}
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

          <button className="gb-btn gb-btn-ghost" style={{ width: '100%' }} onClick={() => router.push('/login')}>
            {t.app.layout.allProjects}
          </button>

          <div>
            <div className="gb-nav-section">{t.app.layout.navSectionProject}</div>
            <nav className="gb-nav">
              {NAV_ITEMS.filter((i) => i.section === 'project').map((item) => (
                <Link key={item.href} href={`${basePath}${item.href}`} className={`gb-nav-link${activeHref === item.href ? ' active' : ''}`}>
                  <item.icon />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="gb-nav-section">{t.app.layout.navSectionConfiguration}</div>
            <nav className="gb-nav">
              {NAV_ITEMS.filter((i) => i.section === 'configuration').map((item) => (
                <Link key={item.href} href={`${basePath}${item.href}`} className={`gb-nav-link${activeHref === item.href ? ' active' : ''}`}>
                  <item.icon />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="gb-sidebar-footer">
            <div className="gb-lang-switch" role="group" aria-label="Language" style={{ marginBottom: 12 }}>
              <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
              <button type="button" className={lang === 'vi' ? 'active' : ''} onClick={() => setLang('vi')}>
                VI
              </button>
            </div>
            <div className="gb-user-row">
              <div className="gb-user-avatar">{brandInitials(username || '?')}</div>
              <div className="gb-user-meta">
                <div className="gb-user-name">{username}</div>
                <div className="gb-user-role">{t.app.layout.signedIn}</div>
              </div>
            </div>
            <button
              className="gb-signout-btn"
              onClick={() => {
                window.localStorage.removeItem('geo_token');
                router.replace('/login');
              }}
            >
              <IconSignOut />
              {t.app.layout.signOut}
            </button>
          </div>
        </aside>

        <div className="gb-main">
          <header className="gb-header">
            <div className="gb-brandpill">
              <div className="gb-brand-badge">{brandInitials(project.name)}</div>
              <div>
                <div className="gb-brand-name">{project.name}</div>
                <div className="gb-brand-meta">{industryLabel(project.industry, lang) || t.app.layout.uncategorized}</div>
              </div>
            </div>
            <div className="gb-header-right">
              <span className="gb-pill">
                {t.app.layout.competitors} {project.competitors.length ? `· ${project.competitors.join(' · ')}` : t.app.layout.competitorsNone}
              </span>
              <span className="gb-pill">{t.app.layout.windowLast14}</span>
              <Link href={`${basePath}/prompts`} className="gb-btn gb-btn-primary">
                {t.app.layout.newPrompt}
              </Link>
            </div>
          </header>

          <div className="gb-content">{children}</div>
        </div>
      </div>
    </ProjectContext.Provider>
  );
}
