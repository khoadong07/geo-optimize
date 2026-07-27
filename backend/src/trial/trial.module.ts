import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { LlmModule } from '../llm/llm.module';
import { MailModule } from '../mail/mail.module';
import { Project, ProjectSchema } from '../projects/project.schema';
import { ProjectsModule } from '../projects/projects.module';
import { PromptSetsModule } from '../prompt-sets/prompt-sets.module';
import { RunJob, RunJobSchema } from '../runs/run-job.schema';
import { RunsModule } from '../runs/runs.module';
import { SiteAuditModule } from '../site-audit/site-audit.module';
import { TrialLead, TrialLeadSchema } from './trial-lead.schema';
import { TrialController } from './trial.controller';
import { TrialService } from './trial.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: TrialLead.name, schema: TrialLeadSchema },
      { name: RunJob.name, schema: RunJobSchema },
    ]),
    AuthModule,
    MailModule,
    LlmModule,
    ProjectsModule,
    PromptSetsModule,
    RunsModule,
    SiteAuditModule,
  ],
  controllers: [TrialController],
  providers: [TrialService],
})
export class TrialModule {}
