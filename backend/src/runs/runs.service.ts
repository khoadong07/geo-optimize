import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthUser } from '../auth/current-user.decorator';
import { LlmService } from '../llm/llm.service';
import { ProjectDocument } from '../projects/project.schema';
import { ProjectsService } from '../projects/projects.service';
import { PromptSetsService } from '../prompt-sets/prompt-sets.service';
import { scanMentions } from './mentions.util';
import { RunJob, RunJobDocument } from './run-job.schema';
import { Run, RunDocument } from './run.schema';
import { classifySentiment } from './sentiment.util';

const PLATFORM_NOTES: Record<'GEMINI' | 'OPENAI', string> = {
  GEMINI: 'Grounding with Google Search: on',
  OPENAI: 'No citations unless the web-search tool is enabled',
};

interface Job {
  promptSetId: string;
  text: string;
  intent: string;
  platform: 'GEMINI' | 'OPENAI';
}

@Injectable()
export class RunsService {
  constructor(
    @InjectModel(Run.name) private readonly runModel: Model<RunDocument>,
    @InjectModel(RunJob.name) private readonly runJobModel: Model<RunJobDocument>,
    private readonly projectsService: ProjectsService,
    private readonly promptSetsService: PromptSetsService,
    private readonly llmService: LlmService,
  ) {}

  private async mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let cursor = 0;
    const worker = async () => {
      while (cursor < items.length) {
        const i = cursor++;
        results[i] = await fn(items[i]);
      }
    };
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
    return results;
  }

  // Validates synchronously (so bad requests fail fast), then kicks off the
  // actual LLM calls in the background and returns immediately — a full run
  // can take a minute or more, far too long to hold an HTTP request open.
  async startExecute(projectId: string, user: AuthUser, promptSetId?: string, promptIds?: string[]) {
    const project = await this.projectsService.getById(projectId, user);

    if (!project.enabledPlatforms.length) {
      throw new BadRequestException('No AI platform is enabled for this project — enable Gemini/OpenAI on Target Position first.');
    }

    const promptSets = promptSetId
      ? [await this.promptSetsService.getById(projectId, promptSetId, user)]
      : await this.promptSetsService.listRawByProject(projectId);

    let allPrompts = promptSets.flatMap((set: any) =>
      (set.prompts || []).map((p: any) => ({ promptId: String(p._id), promptSetId: String(set._id), text: p.text, intent: p.intent })),
    );

    if (!allPrompts.length) {
      throw new BadRequestException('This project has no prompts yet — create a prompt set before running tracking.');
    }

    if (promptIds) {
      const idSet = new Set(promptIds);
      allPrompts = allPrompts.filter((p) => idSet.has(p.promptId));
      if (!allPrompts.length) {
        throw new BadRequestException('No prompts need re-running — every one has already met its target.');
      }
    }

    const jobs: Job[] = [];
    for (const p of allPrompts) {
      for (const platform of project.enabledPlatforms) {
        for (let i = 0; i < project.runsPerPrompt; i++) {
          jobs.push({ promptSetId: p.promptSetId, text: p.text, intent: p.intent, platform });
        }
      }
    }

    const job = await new this.runJobModel({
      projectId,
      promptSetId: promptSetId || null,
      status: 'running',
      totalJobs: jobs.length,
    }).save();

    // Fire-and-forget: not awaited, runs after the response is sent. Any
    // failure is caught and recorded on the job doc rather than thrown here.
    this.runJobsInBackground(String(job._id), projectId, project, jobs).catch(() => {});

    return { jobId: job._id, status: job.status, totalJobs: job.totalJobs };
  }

  private async executeSingleJob(project: ProjectDocument, job: Job) {
    const llm = this.llmService.clientFor(job.platform);
    const { text: rawResponse, modelName } = await llm.generateText(job.text);
    const scan = scanMentions(rawResponse, project.name, project.competitors);
    const sentiment = await classifySentiment(llm, {
      rawResponse,
      brandName: project.name,
      brandMentioned: scan.brandMentioned,
    });

    return {
      projectId: String(project._id),
      promptSetId: job.promptSetId,
      promptText: job.text,
      intent: job.intent,
      platform: job.platform,
      modelName,
      rawResponse,
      brandMentioned: scan.brandMentioned,
      brandMentionPosition: scan.brandMentionPosition,
      competitorsMentioned: scan.competitorsMentioned,
      visibilityScore: scan.visibilityScore,
      sentimentLabel: sentiment.label,
      sentimentReasoning: sentiment.reasoning,
      sentimentTopics: sentiment.topics,
      judgeModel: sentiment.judgeModel,
    };
  }

  private async runJobsInBackground(jobId: string, projectId: string, project: ProjectDocument, jobs: Job[]) {
    const concurrency = Number(process.env.RUN_CONCURRENCY) || 8;
    try {
      const created = await this.mapWithConcurrency(jobs, concurrency, async (job) => {
        try {
          const doc = await this.executeSingleJob(project, job);
          await this.runJobModel.updateOne({ _id: jobId }, { $inc: { completedJobs: 1 } });
          return doc;
        } catch {
          await this.runJobModel.updateOne({ _id: jobId }, { $inc: { failedJobs: 1 } });
          return null;
        }
      });

      const docs = created.filter((d): d is NonNullable<typeof d> => d !== null);
      if (docs.length) {
        await this.runModel.insertMany(docs);
      }

      await this.runJobModel.updateOne({ _id: jobId }, { status: 'completed', finishedAt: new Date() });
    } catch {
      await this.runJobModel.updateOne({ _id: jobId }, { status: 'failed', finishedAt: new Date() });
    }
  }

  // Wrapped in { job } rather than returned bare — a NestJS controller that
  // returns a raw `null` sends an EMPTY response body (Content-Length: 0)
  // instead of the JSON literal "null", which breaks `res.json()` on the
  // client with a parse error when no job exists yet.
  async getLatestJob(projectId: string, user: AuthUser) {
    await this.projectsService.getById(projectId, user);
    const job = await this.runJobModel.findOne({ projectId }).sort({ createdAt: -1 }).lean();
    return { job };
  }

  async listRecent(
    projectId: string,
    user: AuthUser,
    options: { page?: number; limit?: number; platform?: 'GEMINI' | 'OPENAI' } = {},
  ) {
    await this.projectsService.getById(projectId, user);
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const page = options.page && options.page > 0 ? options.page : 1;
    const filter: Record<string, unknown> = { projectId };
    if (options.platform) filter.platform = options.platform;

    const [items, total] = await Promise.all([
      this.runModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.runModel.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  }

  async getOverview(projectId: string, user: AuthUser) {
    const project = await this.projectsService.getById(projectId, user);
    const promptSets = await this.promptSetsService.listRawByProject(projectId);
    const allPrompts = promptSets.flatMap((set: any) =>
      (set.prompts || []).map((p: any) => ({ promptId: String(p._id), promptSetId: String(set._id), text: p.text, intent: p.intent })),
    );

    const runs = await this.runModel.find({ projectId }).sort({ createdAt: -1 }).lean();

    const trackedNames = [{ name: project.name, isBrand: true }, ...project.competitors.map((name) => ({ name, isBrand: false }))];

    function hitsFor(scopedRuns: typeof runs) {
      const counts = new Map<string, number>();
      for (const r of scopedRuns) {
        if (r.brandMentioned) counts.set(project.name, (counts.get(project.name) || 0) + 1);
        for (const c of r.competitorsMentioned) counts.set(c.name, (counts.get(c.name) || 0) + 1);
      }
      return counts;
    }

    const overallCounts = hitsFor(runs);
    const totalHits = [...overallCounts.values()].reduce((a, b) => a + b, 0);
    const shareOfVoice = totalHits
      ? trackedNames
          .map((t) => ({ name: t.name, isBrand: t.isBrand, percent: Math.round(((overallCounts.get(t.name) || 0) / totalHits) * 1000) / 10 }))
          .filter((t) => t.percent > 0)
          .sort((a, b) => b.percent - a.percent)
      : [];

    const visibilityScore = runs.length
      ? Math.round((runs.reduce((sum, r) => sum + r.visibilityScore, 0) / runs.length) * 10) / 10
      : null;

    const trendMap = new Map<string, { sum: number; count: number }>();
    for (const r of runs) {
      const day = (r as any).createdAt.toISOString().slice(0, 10);
      const entry = trendMap.get(day) || { sum: 0, count: 0 };
      entry.sum += r.visibilityScore;
      entry.count += 1;
      trendMap.set(day, entry);
    }
    const trend = [...trendMap.entries()]
      .map(([date, { sum, count }]) => ({ date, score: Math.round((sum / count) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const sentimentCounts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, NOT_APPLICABLE: 0 };
    for (const r of runs) sentimentCounts[r.sentimentLabel] += 1;
    const sentimentBreakdown = runs.length
      ? {
          positive: Math.round((sentimentCounts.POSITIVE / runs.length) * 1000) / 10,
          neutral: Math.round((sentimentCounts.NEUTRAL / runs.length) * 1000) / 10,
          negative: Math.round((sentimentCounts.NEGATIVE / runs.length) * 1000) / 10,
          notApplicable: Math.round((sentimentCounts.NOT_APPLICABLE / runs.length) * 1000) / 10,
        }
      : null;

    const platforms = project.enabledPlatforms.map((platform) => {
      const platformRuns = runs.filter((r) => r.platform === platform);
      return {
        platform,
        totalRuns: platformRuns.length,
        appearanceRatePercent: platformRuns.length
          ? Math.round((platformRuns.filter((r) => r.brandMentioned).length / platformRuns.length) * 1000) / 10
          : null,
        avgVisibilityScore: platformRuns.length
          ? Math.round((platformRuns.reduce((s, r) => s + r.visibilityScore, 0) / platformRuns.length) * 10) / 10
          : null,
        note: PLATFORM_NOTES[platform],
      };
    });

    const prompts = allPrompts.map((p) => {
      const promptRuns = runs.filter((r) => r.promptSetId === p.promptSetId && r.promptText === p.text);
      const recentSignals = promptRuns
        .slice(0, 10)
        .reverse()
        .map((r) => r.brandMentioned);

      if (!promptRuns.length) {
        return { ...p, visibilityScore: null, recentSignals: [], sovDeltaVsTopCompetitor: null, topCompetitorName: null, status: 'no-data' as const };
      }

      const promptScore = Math.round((promptRuns.reduce((s, r) => s + r.visibilityScore, 0) / promptRuns.length) * 10) / 10;
      const promptCounts = hitsFor(promptRuns);
      const brandCount = promptCounts.get(project.name) || 0;
      const topCompetitor = project.competitors
        .map((name) => ({ name, count: promptCounts.get(name) || 0 }))
        .sort((a, b) => b.count - a.count)[0];

      const promptTotalHits = [...promptCounts.values()].reduce((a, b) => a + b, 0);
      const sovDeltaVsTopCompetitor =
        topCompetitor && promptTotalHits
          ? Math.round((((brandCount - topCompetitor.count) / promptTotalHits) * 100) * 10) / 10
          : null;

      const status: 'target-met' | 'competitor-leading' | 'tracking' =
        promptScore >= project.targetVisibilityScore
          ? 'target-met'
          : topCompetitor && topCompetitor.count > brandCount
            ? 'competitor-leading'
            : 'tracking';

      return {
        ...p,
        visibilityScore: promptScore,
        recentSignals,
        sovDeltaVsTopCompetitor,
        topCompetitorName: topCompetitor?.count ? topCompetitor.name : null,
        status,
      };
    });

    return {
      visibilityScore,
      targetVisibilityScore: project.targetVisibilityScore,
      totalRuns: runs.length,
      trend,
      shareOfVoice,
      sentimentBreakdown,
      platforms,
      prompts,
    };
  }

  async getSentimentStats(projectId: string, user: AuthUser) {
    await this.projectsService.getById(projectId, user);
    const runs = await this.runModel.find({ projectId }).sort({ createdAt: 1 }).lean();

    function breakdown(scopedRuns: typeof runs) {
      const counts = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0, NOT_APPLICABLE: 0 };
      for (const r of scopedRuns) counts[r.sentimentLabel] += 1;
      const total = scopedRuns.length || 1;
      return {
        total: scopedRuns.length,
        positive: Math.round((counts.POSITIVE / total) * 1000) / 10,
        neutral: Math.round((counts.NEUTRAL / total) * 1000) / 10,
        negative: Math.round((counts.NEGATIVE / total) * 1000) / 10,
        notApplicable: Math.round((counts.NOT_APPLICABLE / total) * 1000) / 10,
      };
    }

    const platformsPresent = [...new Set(runs.map((r) => r.platform))];
    const byPlatform = platformsPresent.map((platform) => ({
      platform,
      ...breakdown(runs.filter((r) => r.platform === platform)),
    }));

    const intentsPresent = [...new Set(runs.map((r) => r.intent))];
    const byIntent = intentsPresent.map((intent) => ({
      intent,
      ...breakdown(runs.filter((r) => r.intent === intent)),
    }));

    const dayMap = new Map<string, typeof runs>();
    for (const r of runs) {
      const day = (r as any).createdAt.toISOString().slice(0, 10);
      const bucket = dayMap.get(day) || [];
      bucket.push(r);
      dayMap.set(day, bucket);
    }
    const trend = [...dayMap.entries()]
      .map(([date, dayRuns]) => ({ date, ...breakdown(dayRuns) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topicCounts = new Map<string, number>();
    for (const r of runs) {
      for (const topic of r.sentimentTopics || []) {
        const key = topic.trim();
        if (!key) continue;
        topicCounts.set(key, (topicCounts.get(key) || 0) + 1);
      }
    }
    const topTopics = [...topicCounts.entries()]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { totalRuns: runs.length, byPlatform, byIntent, trend, topTopics };
  }
}
