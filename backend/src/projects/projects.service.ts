import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthUser } from '../auth/current-user.decorator';
import { Project, ProjectDocument } from './project.schema';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>) {}

  list(user: AuthUser) {
    const filter = user.role === 'admin' ? {} : { ownerId: user.sub };
    return this.projectModel.find(filter).lean();
  }

  create(data: Partial<Project>, ownerId: string) {
    const created = new this.projectModel({ ...data, ownerId });
    return created.save();
  }

  async getById(id: string, user: AuthUser) {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    this.assertAccess(project, user);
    return project;
  }

  async update(id: string, data: Partial<Project>, user: AuthUser) {
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
    if (user.role !== 'admin' && project.ownerId !== user.sub) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }
}
