'use client';

import { createContext, useContext } from 'react';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type Project = {
  _id: string;
  name: string;
  industry?: string;
  domain?: string;
  competitors: string[];
  enabledPlatforms: Array<'GEMINI' | 'OPENAI'>;
  targetVisibilityScore: number;
  runsPerPrompt: number;
};

export const ProjectContext = createContext<{ project: Project; refresh: () => void } | null>(null);

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjectContext must be used within the project layout');
  return ctx;
}

export function authHeader() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('geo_token') : null;
  return { Authorization: `Bearer ${token}` };
}

export function brandInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}
