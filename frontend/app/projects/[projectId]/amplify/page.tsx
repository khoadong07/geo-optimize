'use client';

import { useLanguage } from '../../../i18n';

export default function AmplifyPage() {
  const { t } = useLanguage();
  return (
    <>
      <p className="gb-eyebrow">{t.app.common.project}</p>
      <h2 className="gb-title">{t.app.layout.navAmplify}</h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        {t.app.amplify.subtitle}
      </p>
      <div className="gb-card gb-empty">
        <strong>{t.app.common.comingSoon}</strong>
        {t.app.amplify.comingSoonBody}
      </div>
    </>
  );
}
