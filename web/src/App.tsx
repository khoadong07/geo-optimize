import { useEffect, useState } from "react";
import {
  fetchDashboard,
  fetchProjects,
  triggerSchedulerTick,
  type DashboardPromptRow,
  type DashboardResponse,
  type Project,
  type SentimentBreakdown,
} from "./api";
import "./App.css";

const INTENT_LABEL: Record<string, string> = {
  DISCOVERY: "Discovery",
  COMPARISON: "Comparison",
  BRANDED: "Branded",
  LONG_TAIL: "Long-tail",
};

// Fixed categorical order (never cycled) — one slot per intent.
const INTENT_SLOT: Record<string, number> = {
  DISCOVERY: 1,
  COMPARISON: 2,
  BRANDED: 3,
  LONG_TAIL: 4,
};

const SENTIMENT_LABEL: Record<string, string> = {
  POSITIVE: "Tích cực",
  NEUTRAL: "Trung lập",
  NEGATIVE: "Tiêu cực",
  NOT_APPLICABLE: "Không áp dụng",
};

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tickMessage, setTickMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects()
      .then((list) => {
        setProjects(list);
        if (list.length > 0) setSelectedProjectId(list[0].id);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError(null);
    fetchDashboard(selectedProjectId)
      .then(setDashboard)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  async function handleRunScheduler() {
    setTickMessage("Đang chạy...");
    try {
      const result = await triggerSchedulerTick();
      setTickMessage(
        `Đã kiểm tra ${result.schedulesChecked} schedule, chạy ${result.runsExecuted} run` +
          (result.errors.length ? `, ${result.errors.length} lỗi (xem console)` : ""),
      );
      if (result.errors.length) console.warn(result.errors);
      if (selectedProjectId) fetchDashboard(selectedProjectId).then(setDashboard).catch(() => undefined);
    } catch (err) {
      setTickMessage(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>GEO Visibility Dashboard</h1>
          <p className="subtitle">Xếp hạng brand vs đối thủ trong câu trả lời AI, theo từng prompt.</p>
        </div>
      </header>

      <section className="toolbar card">
        <label className="field">
          <span className="field-label">Project</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={projects.length === 0}
          >
            {projects.length === 0 && <option value="">Chưa có project nào</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-primary" onClick={handleRunScheduler}>
          Chạy scheduler ngay
        </button>
        {tickMessage && <span className="tick-message">{tickMessage}</span>}
      </section>

      {error && (
        <div className="card state-card state-error">
          <strong>Lỗi.</strong> {error}
        </div>
      )}
      {loading && <div className="card state-card">Đang tải...</div>}
      {dashboard && !loading && <DashboardTable dashboard={dashboard} />}
    </div>
  );
}

function DashboardTable({ dashboard }: { dashboard: DashboardResponse }) {
  if (dashboard.prompts.length === 0) {
    return (
      <div className="card state-card">
        Project <strong>{dashboard.project.name}</strong> chưa có prompt ACTIVE nào.
      </div>
    );
  }

  return (
    <section className="card table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Prompt Set / Intent</th>
              <th>Câu hỏi</th>
              <th className="num">Số run</th>
              <th className="num">Tỷ lệ xuất hiện</th>
              <th>Visibility Score TB</th>
              <th>Sentiment</th>
              <th>Đối thủ</th>
            </tr>
          </thead>
          <tbody>
            {dashboard.prompts.map((p) => (
              <PromptRow key={p.promptId} prompt={p} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PromptRow({ prompt: p }: { prompt: DashboardPromptRow }) {
  return (
    <tr>
      <td>
        <div>{p.promptSetName}</div>
        <IntentBadge intent={p.intent} />
      </td>
      <td className="question-cell">{p.text}</td>
      <td className="num tabular">{p.totalRuns}</td>
      <td className="num tabular">{p.appearanceRate ?? "–"}%</td>
      <td>
        <VisibilityMeter score={p.avgVisibilityScore} />
      </td>
      <td>
        <SentimentBadges breakdown={p.sentimentBreakdown} />
      </td>
      <td>
        {p.competitors.length === 0 ? (
          <span className="muted">—</span>
        ) : (
          <ul className="competitor-list">
            {p.competitors.map((c) => (
              <li key={c.competitorId}>
                {c.name} <span className="muted tabular">{c.appearanceRate}% · vị trí TB {c.avgPosition}</span>
              </li>
            ))}
          </ul>
        )}
      </td>
    </tr>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const slot = INTENT_SLOT[intent] ?? 1;
  return (
    <span className="badge" data-slot={slot}>
      <span className="badge-dot" />
      {INTENT_LABEL[intent] ?? intent}
    </span>
  );
}

function VisibilityMeter({ score }: { score: number | null }) {
  if (score === null) return <span className="muted">–</span>;
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="meter" title={`${score}/100`}>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="meter-value tabular">{score}</span>
    </div>
  );
}

const SENTIMENT_STATUS: Record<string, "good" | "critical" | "neutral" | "muted"> = {
  POSITIVE: "good",
  NEGATIVE: "critical",
  NEUTRAL: "neutral",
  NOT_APPLICABLE: "muted",
};

function SentimentBadges({ breakdown }: { breakdown: SentimentBreakdown }) {
  return (
    <div className="sentiment-list">
      {Object.entries(breakdown)
        .filter(([, count]) => count > 0)
        .map(([label, count]) => (
          <span key={label} className="badge status" data-status={SENTIMENT_STATUS[label] ?? "muted"}>
            <span className="badge-dot" />
            {SENTIMENT_LABEL[label] ?? label}
            <span className="tabular">&nbsp;{count}</span>
          </span>
        ))}
      {Object.values(breakdown).every((c) => c === 0) && <span className="muted">Chưa có run nào</span>}
    </div>
  );
}
