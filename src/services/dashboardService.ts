import { prisma } from "../lib/prisma";
import { notFound } from "../lib/httpError";
import type { CompetitorMention } from "./visibilityService";

const SENTIMENT_LABELS = ["POSITIVE", "NEUTRAL", "NEGATIVE", "NOT_APPLICABLE"] as const;

// MVP dashboard: per-prompt visibility ranking of the brand vs. its
// competitors, computed live from the last 50 runs of each prompt. No
// materialized rollup table yet — fine at MVP data volumes; revisit if this
// query gets slow once run history grows.
export async function getProjectDashboard(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound("Project");

  const prompts = await prisma.prompt.findMany({
    where: { projectId, status: "ACTIVE" },
    include: { currentVersion: true, promptSet: true },
    orderBy: { createdAt: "asc" },
  });

  const rows = await Promise.all(
    prompts.map(async (prompt) => {
      const runs = await prisma.run.findMany({
        where: { promptVersion: { promptId: prompt.id } },
        include: { sentiment: true },
        orderBy: { executedAt: "desc" },
        take: 50,
      });

      const totalRuns = runs.length;
      const appearances = runs.filter((r) => r.brandMentioned).length;
      const avgVisibilityScore = totalRuns
        ? Number((runs.reduce((sum, r) => sum + Number(r.visibilityScore), 0) / totalRuns).toFixed(2))
        : null;

      const sentimentBreakdown = Object.fromEntries(SENTIMENT_LABELS.map((l) => [l, 0])) as Record<
        (typeof SENTIMENT_LABELS)[number],
        number
      >;
      for (const run of runs) {
        if (run.sentiment) sentimentBreakdown[run.sentiment.label] += 1;
      }

      const competitorStats = new Map<string, { name: string; appearances: number; positions: number[] }>();
      for (const run of runs) {
        const mentioned = (run.competitorsMentioned as unknown as CompetitorMention[] | null) ?? [];
        for (const c of mentioned) {
          const entry = competitorStats.get(c.competitorId) ?? { name: c.name, appearances: 0, positions: [] };
          entry.appearances += 1;
          entry.positions.push(c.position);
          competitorStats.set(c.competitorId, entry);
        }
      }

      return {
        promptId: prompt.id,
        promptSetName: prompt.promptSet.name,
        intent: prompt.intent,
        text: prompt.currentVersion?.text ?? null,
        totalRuns,
        appearanceRate: totalRuns ? Number(((appearances / totalRuns) * 100).toFixed(1)) : null,
        avgVisibilityScore,
        sentimentBreakdown,
        competitors: Array.from(competitorStats.entries()).map(([competitorId, s]) => ({
          competitorId,
          name: s.name,
          appearanceRate: Number(((s.appearances / totalRuns) * 100).toFixed(1)),
          avgPosition: Number((s.positions.reduce((a, b) => a + b, 0) / s.positions.length).toFixed(2)),
        })),
      };
    }),
  );

  return { project: { id: project.id, name: project.name }, prompts: rows };
}
