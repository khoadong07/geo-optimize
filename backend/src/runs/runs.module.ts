import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmModule } from '../llm/llm.module';
import { ProjectsModule } from '../projects/projects.module';
import { PromptSetsModule } from '../prompt-sets/prompt-sets.module';
import { RunJob, RunJobSchema } from './run-job.schema';
import { Run, RunSchema } from './run.schema';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Run.name, schema: RunSchema },
      { name: RunJob.name, schema: RunJobSchema },
    ]),
    ProjectsModule,
    PromptSetsModule,
    LlmModule,
  ],
  controllers: [RunsController],
  providers: [RunsService],
})
export class RunsModule {}
