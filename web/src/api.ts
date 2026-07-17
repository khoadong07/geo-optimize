export interface Project {
  id: string;
  name: string;
  industry: string | null;
  officialWebsite: string | null;
  status: "ACTIVE" | "ARCHIVED";
}

export interface SentimentBreakdown {
  POSITIVE: number;
  NEUTRAL: number;
  NEGATIVE: number;
  NOT_APPLICABLE: number;
}

export interface CompetitorStat {
  competitorId: string;
  name: string;
  appearanceRate: number;
  avgPosition: number;
}

export interface DashboardPromptRow {
  promptId: string;
  promptSetName: string;
  intent: string;
  text: string | null;
  totalRuns: number;
  appearanceRate: number | null;
  avgVisibilityScore: number | null;
  sentimentBreakdown: SentimentBreakdown;
  competitors: CompetitorStat[];
}

export interface DashboardResponse {
  project: { id: string; name: string };
  prompts: DashboardPromptRow[];
}

export interface SchedulerTickResult {
  schedulesChecked: number;
  runsExecuted: number;
  errors: string[];
}

async function asJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchProjects(): Promise<Project[]> {
  return fetch("/api/projects").then((res) => asJson<Project[]>(res));
}

export function fetchDashboard(projectId: string): Promise<DashboardResponse> {
  return fetch(`/api/projects/${encodeURIComponent(projectId)}/dashboard`).then((res) =>
    asJson<DashboardResponse>(res),
  );
}

export function triggerSchedulerTick(): Promise<SchedulerTickResult> {
  return fetch("/api/scheduler/tick", { method: "POST" }).then((res) => asJson<SchedulerTickResult>(res));
}
