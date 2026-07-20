import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthUser } from '../auth/current-user.decorator';
import { ProjectsService } from '../projects/projects.service';
import { Run, RunDocument } from '../runs/run.schema';
import { generatePromptCandidates } from './generate.util';
import { PromptEntry, PromptIntent, PromptSet, PromptSetDocument } from './prompt-set.schema';

@Injectable()
export class PromptSetsService {
  constructor(
    @InjectModel(PromptSet.name) private readonly promptSetModel: Model<PromptSetDocument>,
    @InjectModel(Run.name) private readonly runModel: Model<RunDocument>,
    private readonly projectsService: ProjectsService,
  ) {}

  async listByProject(projectId: string, user: AuthUser) {
    await this.projectsService.getById(projectId, user); // throws if no access
    return this.promptSetModel.find({ projectId }).lean();
  }

  // Internal use by RunsService — caller is responsible for having already
  // verified project access, so this skips the ownership check.
  listRawByProject(projectId: string) {
    return this.promptSetModel.find({ projectId }).lean();
  }

  async create(projectId: string, name: string, prompts: PromptEntry[], user: AuthUser) {
    await this.projectsService.getById(projectId, user);
    const created = new this.promptSetModel({ projectId, name, prompts, createdBy: user.sub });
    return created.save();
  }

  async getById(projectId: string, id: string, user: AuthUser) {
    await this.projectsService.getById(projectId, user);
    const promptSet = await this.promptSetModel.findOne({ _id: id, projectId }).lean();
    if (!promptSet) throw new NotFoundException('Prompt set not found');
    return promptSet;
  }

  async remove(projectId: string, id: string, user: AuthUser) {
    await this.projectsService.getById(projectId, user);
    const deleted = await this.promptSetModel.findOneAndDelete({ _id: id, projectId });
    if (!deleted) throw new NotFoundException('Prompt set not found');
    await this.runModel.deleteMany({ projectId, promptSetId: id });
    return { deleted: true };
  }

  async updatePrompt(
    projectId: string,
    setId: string,
    promptId: string,
    data: { text?: string; intent?: PromptIntent },
    user: AuthUser,
  ) {
    await this.projectsService.getById(projectId, user);
    const promptSet = await this.promptSetModel.findOne({ _id: setId, projectId });
    if (!promptSet) throw new NotFoundException('Prompt set not found');
    const entry = (promptSet.prompts as any).id(promptId);
    if (!entry) throw new NotFoundException('Prompt not found');
    if (data.text !== undefined) entry.text = data.text;
    if (data.intent !== undefined) entry.intent = data.intent;
    await promptSet.save();
    return promptSet;
  }

  async removePrompt(projectId: string, setId: string, promptId: string, user: AuthUser) {
    await this.projectsService.getById(projectId, user);
    const promptSet = await this.promptSetModel.findOne({ _id: setId, projectId });
    if (!promptSet) throw new NotFoundException('Prompt set not found');
    const entry = (promptSet.prompts as any).id(promptId);
    if (!entry) throw new NotFoundException('Prompt not found');
    const promptText = entry.text;
    entry.deleteOne();
    await promptSet.save();
    await this.runModel.deleteMany({ projectId, promptSetId: setId, promptText });
    return { deleted: true };
  }

  async generateCandidates(projectId: string, intent: PromptIntent, user: AuthUser, trendingTopics?: string[]) {
    const project = await this.projectsService.getById(projectId, user);

    try {
      const candidates = await generatePromptCandidates({
        brandName: project.name,
        industry: project.industry || 'chưa xác định',
        competitors: project.competitors,
        intent,
        count: 7,
        trendingTopics,
      });
      return { intent, candidates };
    } catch {
      throw new BadRequestException('AI question generation failed — try again.');
    }
  }
}
