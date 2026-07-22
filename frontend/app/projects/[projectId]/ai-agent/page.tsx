'use client';

import { useLanguage } from '../../../i18n';

export default function AiAgentPage() {
  const { t } = useLanguage();
  return (
    <>
      <p className="gb-eyebrow">{t.app.common.project}</p>
      <h2 className="gb-title">{t.app.layout.navAiAgent}</h2>
      <p className="gb-subtitle" style={{ marginBottom: 20 }}>
        {t.app.aiAgent.subtitle}
      </p>
      <div className="gb-card gb-empty">
        <strong>{t.app.common.comingSoon}</strong>
        {t.app.aiAgent.comingSoonBody}
      </div>
    </>
  );
}
