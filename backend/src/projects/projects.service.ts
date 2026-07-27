import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthUser } from '../auth/current-user.decorator';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  list(user: AuthUser) {
    const filter = user.role === 'admin' ? {} : user.role === 'trial' ? { _id: user.sub } : { ownerId: user.sub };
    return this.projectModel.find(filter).lean();
  }

  async create(data: Partial<Project>, user: AuthUser) {
    await this.assertPlanLimits(user, data);

    if (user.role === 'customer' && user.maxProjects !== undefined) {
      const count = await this.projectModel.countDocuments({ ownerId: user.sub });
      if (count >= user.maxProjects) {
        throw new ForbiddenException(`Your plan allows up to ${user.maxProjects} project(s) — upgrade to add more.`);
      }
    }

    const created = new this.projectModel({ ...data, ownerId: user.sub });
    return created.save();
  }

  async getById(id: string, user: AuthUser) {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    this.assertAccess(project, user);
    return project;
  }

  async update(id: string, data: Partial<Project>, user: AuthUser) {
    await this.assertPlanLimits(user, data);
    const project = await this.getById(id, user);
    Object.assign(project, data);
    return project.save();
  }

  async remove(id: string, user: AuthUser) {
    const project = await this.getById(id, user);
    await project.deleteOne();
    return { deleted: true };
  }

  private assertAccess(project: ProjectDocument, user: AuthUser) {
    if (user.role === 'admin') return;
    if (user.role === 'trial') {
      if ((project._id as any).toString() === user.sub) return;
      throw new ForbiddenException('You do not have access to this project');
    }
    if (project.ownerId !== user.sub) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }

  // Only 'customer' identities (paid via the magic-link flow) carry plan
  // caps baked into their token — admin/user/trial are unaffected.
  private async assertPlanLimits(user: AuthUser, data: Partial<Project>) {
    if (user.role !== 'customer') return;

    if (data.enabledPlatforms?.length) {
      const allowed = new Set(user.allowedPlatforms || []);
      const disallowed = data.enabledPlatforms.filter((p) => !allowed.has(p));
      if (disallowed.length) {
        throw new ForbiddenException(`Your plan does not include: ${disallowed.join(', ')}`);
      }
    }

    if (data.runsPerPrompt !== undefined && user.maxRunsPerPrompt !== undefined && data.runsPerPrompt > user.maxRunsPerPrompt) {
      throw new ForbiddenException(`Your plan allows at most ${user.maxRunsPerPrompt} run(s) per prompt.`);
    }
  }
}
