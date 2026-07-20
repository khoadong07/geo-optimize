import { execFile } from 'child_process';
import { promisify } from 'util';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthUser } from '../auth/current-user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { SiteAuditJob, SiteAuditJobDocument } from './site-audit-job.schema';
import { SiteAudit, SiteAuditDocument } from './site-audit.schema';

const execFileAsync = promisify(execFile);

// geo-optimizer-skill (https://github.com/Auriti-Labs/geo-optimizer-skill) —
// fetches the live site and can take 10-60s depending on target latency, so
// this always runs as a background job, same pattern as prompt runs.
const AUDIT_TIMEOUT_MS = 90_000;

interface GeoCliResult {
  url: string;
  score: number;
  band: string;
  error: string | null;
  checks: Record<string, unknown>;
  score_breakdown: Record<string, number>;
  recommendations: string[];
  http_status?: number | null;
  audit_duration_ms?: number | null;
}

function normalizeUrl(domain: string): string {
  return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`;
}

@Injectable()
export class SiteAuditService {
  private readonly logger = new Logger(SiteAuditService.name);

  constructor(
    @InjectModel(SiteAudit.name) private readonly siteAuditModel: Model<SiteAuditDocument>,
    @InjectModel(SiteAuditJob.name) private readonly jobModel: Model<SiteAuditJobDocument>,
    private readonly projectsService: ProjectsService,
  ) {}

  async startAudit(projectId: string, user: AuthUser) {
    const project = await this.projectsService.getById(projectId, user);
    if (!project.domain) {
      throw new BadRequestException('This project has no website set — set "Official website" on Target Position first.');
    }

    const job = await new this.jobModel({ projectId, status: 'running' }).save();
    this.runInBackground(String(job._id), projectId, normalizeUrl(project.domain)).catch(() => {});

    return { jobId: job._id, status: job.status };
  }

  private async runInBackground(jobId: string, projectId: string, url: string) {
    try {
      const { stdout } = await execFileAsync('geo', ['audit', '--url', url, '--format', 'json'], {
        timeout: AUDIT_TIMEOUT_MS,
        maxBuffer: 10 * 1024 * 1024,
      });

      const result: GeoCliResult = JSON.parse(stdout);

      await new this.siteAuditModel({
        projectId,
        url: result.url,
        score: result.score,
        band: result.band,
        checks: result.checks,
        scoreBreakdown: result.score_breakdown,
        recommendations: result.recommendations,
        httpStatus: result.http_status ?? null,
        auditDurationMs: result.audit_duration_ms ?? null,
        error: result.error,
      }).save();

      await this.jobModel.updateOne({ _id: jobId }, { status: 'completed', finishedAt: new Date() });
    } catch (err) {
      this.logger.error(`Site audit failed for project ${projectId}: ${(err as Error).message}`);
      await this.jobModel.updateOne(
        { _id: jobId },
        { status: 'failed', finishedAt: new Date(), errorMessage: (err as Error).message.slice(0, 500) },
      );
    }
  }

  // Wrapped in { job } / { audit } rather than returned bare — a NestJS
  // controller that returns a raw `null` sends an EMPTY response body
  // (Content-Length: 0) instead of the JSON literal "null", which breaks
  // `res.json()` on the client with a parse error. Wrapping guarantees the
  // top-level response is always a real object.
  async getLatestJob(projectId: string, user: AuthUser) {
    await this.projectsService.getById(projectId, user);
    const job = await this.jobModel.findOne({ projectId }).sort({ createdAt: -1 }).lean();
    return { job };
  }

  async getLatestAudit(projectId: string, user: AuthUser) {
    await this.projectsService.getById(projectId, user);
    const audit = await this.siteAuditModel.findOne({ projectId }).sort({ createdAt: -1 }).lean();
    return { audit };
  }
}
