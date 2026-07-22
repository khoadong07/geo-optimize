'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from './i18n';

type Step = 'typing' | 'thinking' | 'gemini' | 'openai' | 'hold';

const STEP_ORDER: Step[] = ['typing', 'thinking', 'gemini', 'openai', 'hold'];
const STEP_DURATIONS: Record<Step, number> = {
  typing: 1600,
  thinking: 900,
  gemini: 1900,
  openai: 1900,
  hold: 2600,
};

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    const start = performance.now();
    const duration = 700;
    let raf = 0;
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return value;
}

function EngineCard({
  name,
  monogram,
  color,
  bg,
  thinking,
  revealed,
  score,
  rank,
  answer,
  rankLabel,
  positiveLabel,
  waitingLabel,
}: {
  name: string;
  monogram: string;
  color: string;
  bg: string;
  thinking: boolean;
  revealed: boolean;
  score: number;
  rank: number;
  answer: string;
  rankLabel: string;
  positiveLabel: string;
  waitingLabel: string;
}) {
  return (
    <div className="gb-mkt-engine">
      <div className="gb-mkt-engine-head">
        <div className="gb-mkt-engine-dot" style={{ background: bg, color }}>
          {monogram}
        </div>
        <div className="gb-mkt-engine-name">{name}</div>
      </div>

      {thinking ? (
        <>
          <div className="gb-mkt-shimmer" style={{ width: '100%' }} />
          <div className="gb-mkt-shimmer" style={{ width: '82%' }} />
          <div className="gb-mkt-shimmer" style={{ width: '60%' }} />
        </>
      ) : revealed ? (
        <>
          <div className="gb-mkt-engine-text">&ldquo;{answer}&rdquo;</div>
          <div className="gb-mkt-engine-meta">
            <span className="gb-badge ok">
              {rankLabel} #{rank}
            </span>
            <span className="gb-badge info">{positiveLabel}</span>
          </div>
          <div className="gb-mkt-score-row">
            <div className="gb-mkt-score-track">
              <div className="gb-mkt-score-fill" style={{ width: `${score}%` }} />
            </div>
            <span className="gb-mkt-score-num">{score}</span>
          </div>
        </>
      ) : (
        <div className="gb-mkt-engine-text" style={{ color: 'var(--text-faint)' }}>
          {waitingLabel}
        </div>
      )}
    </div>
  );
}

export default function DemoAnimation() {
  const { t } = useLanguage();
  const query = t.demo.query;
  const answer = t.demo.answer.replace('{{brand}}', t.demo.brand);
  const [step, setStep] = useState<Step>('typing');
  const [typedLength, setTypedLength] = useState(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) {
      setTypedLength(query.length);
      setStep('hold');
    } else {
      setTypedLength(0);
      setStep('typing');
    }
  }, [query]);

  useEffect(() => {
    if (reducedMotion.current || step !== 'typing' || typedLength >= query.length) return;
    const t = setTimeout(() => setTypedLength((n) => n + 1), 26);
    return () => clearTimeout(t);
  }, [step, typedLength, query]);

  useEffect(() => {
    if (reducedMotion.current) return;
    if (step === 'typing' && typedLength < query.length) return;
    const t = setTimeout(() => {
      const idx = STEP_ORDER.indexOf(step);
      const next = STEP_ORDER[(idx + 1) % STEP_ORDER.length];
      if (next === 'typing') setTypedLength(0);
      setStep(next);
    }, STEP_DURATIONS[step]);
    return () => clearTimeout(t);
  }, [step, typedLength, query]);

  const geminiActive = step === 'gemini' || step === 'openai' || step === 'hold';
  const openaiActive = step === 'openai' || step === 'hold';
  const geminiScore = useCountUp(96, geminiActive);
  const openaiScore = useCountUp(81, openaiActive);

  return (
    <div className="gb-mkt-demo">
      <div className="gb-mkt-demo-head">
        <span className="gb-mkt-demo-label">
          <span className="gb-live-dot pulse" aria-hidden="true" />
          {t.demo.liveLabel}
        </span>
        <span className="gb-mkt-demo-clock">{t.demo.simulated}</span>
      </div>

      <div className="gb-mkt-chat">
        {query.slice(0, typedLength)}
        {step === 'typing' ? <span className="gb-mkt-caret" /> : null}
      </div>

      <div className="gb-mkt-engines">
        <EngineCard
          name="Gemini"
          monogram="Ge"
          color="var(--blue)"
          bg="var(--blue-dim)"
          thinking={step === 'thinking'}
          revealed={geminiActive}
          score={geminiScore}
          rank={1}
          answer={answer}
          rankLabel={t.demo.rank}
          positiveLabel={t.demo.positive}
          waitingLabel={t.demo.waiting}
        />
        <EngineCard
          name="OpenAI"
          monogram="Op"
          color="var(--accent)"
          bg="var(--accent-dim)"
          thinking={step === 'thinking'}
          revealed={openaiActive}
          score={openaiScore}
          rank={2}
          answer={answer}
          rankLabel={t.demo.rank}
          positiveLabel={t.demo.positive}
          waitingLabel={t.demo.waiting}
        />
      </div>
    </div>
  );
}
