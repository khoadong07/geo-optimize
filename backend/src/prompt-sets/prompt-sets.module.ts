import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { Run, RunSchema } from '../runs/run.schema';
import { PromptSet, PromptSetSchema } from './prompt-set.schema';
import { PromptSetsController } from './prompt-sets.controller';
import { PromptSetsService } from './prompt-sets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PromptSet.name, schema: PromptSetSchema },
      { name: Run.name, schema: RunSchema },
    ]),
    ProjectsModule,
  ],
  controllers: [PromptSetsController],
  providers: [PromptSetsService],
  exports: [PromptSetsService],
})
export class PromptSetsModule {}
