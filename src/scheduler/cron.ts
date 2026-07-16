import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { executeRun } from "../services/runService";

const FREQUENCY_MS: Record<"DAILY" | "WEEKLY", number> = {
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
};

async function isDue(scheduleConfigId: string, frequency: "DAILY" | "WEEKLY"): Promise<boolean> {
  const lastRun = await prisma.run.findFirst({
    where: { scheduleConfigId },
    orderBy: { executedAt: "desc" },
  });
  if (!lastRun) return true;
  return Date.now() - lastRun.executedAt.getTime() >= FREQUENCY_MS[frequency];
}

export interface TickResult {
  schedulesChecked: number;
  runsExecuted: number;
  errors: string[];
}

// MVP scheduler: due-check derived from the schedule's last Run timestamp
// (see plan note — no separate "lastRunAt" column needed). Auto-maintenance
// tier transitions (STANDARD -> MAINTENANCE on target-met) are NOT
// implemented here — that requires the Target/Gap evaluation logic from
// Module 3, which is out of scope for this pass; priorityTier only changes
// via the manual ScheduleConfig update endpoint for now.
export async function tickSchedules(): Promise<TickResult> {
  const schedules = await prisma.scheduleConfig.findMany({
    where: { isPaused: false },
    include: { prompt: true, promptGroup: { include: { prompts: true } } },
  });

  let runsExecuted = 0;
  const errors: string[] = [];

  for (const schedule of schedules) {
    const due = await isDue(schedule.id, schedule.frequency);
    if (!due) continue;

    const targetPrompts = (schedule.prompt ? [schedule.prompt] : schedule.promptGroup?.prompts ?? []).filter(
      (p) => p.status === "ACTIVE",
    );
    if (targetPrompts.length === 0) continue;

    const platformConfigs = await prisma.projectPlatformConfig.findMany({
      where: { projectId: schedule.projectId, isEnabled: true },
    });

    for (const prompt of targetPrompts) {
      for (const platformConfig of platformConfigs) {
        for (let i = 1; i <= schedule.runsPerCycle; i++) {
          try {
            await executeRun({
              promptId: prompt.id,
              platform: platformConfig.platform,
              scheduleConfigId: schedule.id,
              runIndexInCycle: i,
            });
            runsExecuted += 1;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            errors.push(`schedule=${schedule.id} prompt=${prompt.id} platform=${platformConfig.platform}: ${message}`);
          }
        }
      }
    }
  }

  return { schedulesChecked: schedules.length, runsExecuted, errors };
}

export function startScheduler(): void {
  // Hourly tick is cheap (a handful of due-checks); DAILY/WEEKLY granularity
  // comes from isDue(), not from the cron interval itself.
  cron.schedule("0 * * * *", () => {
    tickSchedules()
      .then(({ schedulesChecked, runsExecuted, errors }) => {
        console.log(`[scheduler] checked ${schedulesChecked} schedule(s), executed ${runsExecuted} run(s), ${errors.length} error(s)`);
        errors.forEach((e) => console.error(`[scheduler] ${e}`));
      })
      .catch((err) => console.error("[scheduler] tick failed:", err));
  });
}
