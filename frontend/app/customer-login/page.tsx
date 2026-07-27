'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../i18n';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [status, setStatus] = useState<'checking' | 'invalid'>('checking');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('invalid');
      return;
    }
    window.localStorage.setItem('geo_token', token);
    router.replace('/login');
  }, [router]);

  if (status === 'invalid') {
    return (
      <div className="gb-auth-wrap">
        <div className="gb-auth-card">
          <p className="gb-eyebrow">GeoBase</p>
          <h1>{t.customerLogin.invalidTitle}</h1>
          <p>{t.customerLogin.invalidBody}</p>
          <button className="gb-btn gb-btn-primary" onClick={() => router.push('/login')}>
            {t.customerLogin.backToLogin}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gb-auth-wrap">
      <p style={{ color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{t.customerLogin.signingIn}</p>
    </div>
  );
}
