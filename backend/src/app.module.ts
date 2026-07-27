import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PlanOrdersModule } from './plan-orders/plan-orders.module';
import { ProjectsModule } from './projects/projects.module';
import { PromptSetsModule } from './prompt-sets/prompt-sets.module';
import { ReportOrdersModule } from './report-orders/report-orders.module';
import { ReportsModule } from './reports/reports.module';
import { RunsModule } from './runs/runs.module';
import { SiteAuditModule } from './site-audit/site-audit.module';
import { TrendingModule } from './trending/trending.module';
import { TrendingTopicsModule } from './trending-topics/trending-topics.module';
import { TrialModule } from './trial/trial.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/geo-optimize'),
    AuthModule,
    ProjectsModule,
    PromptSetsModule,
    RunsModule,
    SiteAuditModule,
    TrendingModule,
    TrendingTopicsModule,
    TrialModule,
    ReportsModule,
    ReportOrdersModule,
    PlanOrdersModule,
  ],
})
export class AppModule {}
