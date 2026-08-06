import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { AuthUser } from '../auth/current-user.decorator';
import { IndustriesService } from '../industries/industries.service';
import { LlmService } from '../llm/llm.service';
import { MailService } from '../mail/mail.service';
import { Project, ProjectDocument } from '../projects/project.schema';
import { ProjectsService } from '../projects/projects.service';
import { generatePromptCandidates } from '../prompt-sets/generate.util';
import { PromptIntent } from '../prompt-sets/prompt-set.schema';
import { PromptSetsService } from '../prompt-sets/prompt-sets.service';
import { RunJob, RunJobDocument } from '../runs/run-job.schema';
import { RunsService } from '../runs/runs.service';
import { SiteAuditService } from '../site-audit/site-audit.service';
import { detectIndustryAndCompetitors } from './industry-detect.util';
import { TrialLead, TrialLeadDocument, TrialLeadStatus } from './trial-lead.schema';
import { fetchWebsiteText } from './website-fetch.util';

// No "Comparison" intent here on purpose — those ask A-vs-B questions naming
// specific competitors, which the trial's auto-generated set skips. The
// other 3 intents absorb its 3 slots so the total stays 10.
const INTENT_COUNTS: Array<[PromptIntent, number]> = [
  ['Discovery', 4],
  ['Branded', 3],
  ['Long-tail', 3],
];

function normalizeDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
}

@Injectable()
export class TrialService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(TrialLead.name) private readonly trialLeadModel: Model<TrialLeadDocument>,
    @InjectModel(RunJob.name) private readonly runJobModel: Model<RunJobDocument>,
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly llmService: LlmService,
    private readonly industriesService: IndustriesService,
    private readonly projectsService: ProjectsService,
    private readonly promptSetsService: PromptSetsService,
    private readonly runsService: RunsService,
    private readonly siteAuditService: SiteAuditService,
  ) {}

  async analyze(domainInput: string, zone: string) {
    const domain = normalizeDomain(domainInput);

    // Reuse an existing trial for this exact domain if one has already been
    // set up (has a run job, whether still running or completed) — skips
    // the website fetch, LLM classification, and question generation
    // entirely, and lets the visitor land straight on the live/finished
    // report via the same job-polling the trial page already does.
    const existing = await this.projectModel.findOne({ domain, visibility: 'trial' }).sort({ createdAt: -1 });
    if (existing) {
      const hasJob = await this.runJobModel.exists({ projectId: existing._id.toString() });
      if (hasJob) {
        const { token } = this.authService.issueTrialToken(existing._id.toString(), existing.name);
        return {
          token,
          project: { id: existing._id, name: existing.name, domain: existing.domain, zone: existing.zone, industry: existing.industry },
          suggestedCompetitors: existing.competitors,
          cached: true,
        };
      }
    }

    const [websiteText, industries] = await Promise.all([fetchWebsiteText(domain), this.industriesService.listNames()]);
    const { brandName, industry, suggestedCompetitors } = await detectIndustryAndCompetitors(this.llmService, {
      domain,
      zone,
      websiteText,
      industries,
    });

    const project = await new this.projectModel({
      ownerId: 'trial',
      name: brandName,
      domain,
      zone,
      industry,
      visibility: 'trial',
      enabledPlatforms: ['OPENAI'],
      runsPerPrompt: 1,
      competitors: [],
      leadCaptured: false,
    }).save();

    const { token } = this.authService.issueTrialToken(project._id.toString(), brandName);

    return {
      token,
      project: { id: project._id, name: project.name, domain: project.domain, zone: project.zone, industry: project.industry },
      suggestedCompetitors,
    };
  }

  async setup(
    projectId: string,
    user: AuthUser,
    body: { competitors: string[]; industry?: string; brandName?: string; lang?: 'en' | 'vi' },
  ) {
    const updateData: Record<string, unknown> = { competitors: body.competitors || [] };
    if (body.industry) updateData.industry = body.industry;
    if (body.brandName) updateData.name = body.brandName;
    const project = await this.projectsService.update(projectId, updateData, user);

    const lang = body.lang === 'en' ? 'en' : 'vi';
    const groups = await Promise.all(
      INTENT_COUNTS.map(([intent, count]) =>
        generatePromptCandidates({
          brandName: project.name,
          industry: project.industry || 'unspecified',
          competitors: project.competitors,
          intent,
          count,
          lang,
        }).then((texts) => texts.map((text) => ({ text, intent }))),
      ),
    );
    const prompts = groups.flat();
    await this.promptSetsService.create(projectId, 'Trial analysis', prompts, user);

    const { jobId: runsJobId } = await this.runsService.startExecute(projectId, user);

    let auditJobId: unknown = null;
    try {
      const audit = await this.siteAuditService.startAudit(projectId, user);
      auditJobId = audit.jobId;
    } catch {
      // Domain is always set for a trial project, but don't let a transient
      // audit-trigger failure block the tracking run from proceeding.
    }

    return { runsJobId, auditJobId };
  }

  async captureLead(projectId: string, user: AuthUser, body: { name: string; email: string; company: string }) {
    const project = await this.projectsService.getById(projectId, user);

    const lead = new this.trialLeadModel({ projectId, name: body.name, email: body.email, company: body.company });

    const appUrl = process.env.APP_URL || 'http://localhost:3002';
    const { token } = this.authService.issueTrialToken(projectId, body.name);
    const previewUrl = `${appUrl}/trial/${projectId}?token=${token}`;
    const { sent } = await this.mailService.sendTrialPreviewEmail(body.email, body.name, previewUrl);
    lead.previewEmailSent = sent;
    await lead.save();

    project.leadCaptured = true;
    await project.save();

    return { sent };
  }

  listLeads() {
    return this.trialLeadModel.find().sort({ createdAt: -1 }).lean();
  }

  async setLeadStatus(id: string, status: TrialLeadStatus) {
    const updated = await this.trialLeadModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) throw new NotFoundException('Trial lead not found');
    return updated;
  }

  async removeLead(id: string) {
    const deleted = await this.trialLeadModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Trial lead not found');
    return { deleted: true };
  }
}
