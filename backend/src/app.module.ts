import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { PromptSetsModule } from './prompt-sets/prompt-sets.module';
import { RunsModule } from './runs/runs.module';
import { SiteAuditModule } from './site-audit/site-audit.module';
import { TrendingModule } from './trending/trending.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geo-optimize'),
    AuthModule,
    ProjectsModule,
    PromptSetsModule,
    RunsModule,
    SiteAuditModule,
    TrendingModule,
  ],
})
export class AppModule {}
