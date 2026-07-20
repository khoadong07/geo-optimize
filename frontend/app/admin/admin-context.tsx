'use client';

import { createContext, useContext } from 'react';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type AdminSession = {
  username: string;
  role: 'admin' | 'user';
};

export const AdminSessionContext = createContext<AdminSession | null>(null);

export function useAdminSession() {
  const session = useContext(AdminSessionContext);
  if (!session) throw new Error('useAdminSession must be used within the admin layout');
  return session;
}

export function authHeader() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('geo_token') : null;
  return { Authorization: `Bearer ${token}` };
}
