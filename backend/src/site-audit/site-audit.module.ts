import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from '../projects/projects.module';
import { SiteAuditJob, SiteAuditJobSchema } from './site-audit-job.schema';
import { SiteAudit, SiteAuditSchema } from './site-audit.schema';
import { SiteAuditController } from './site-audit.controller';
import { SiteAuditService } from './site-audit.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SiteAudit.name, schema: SiteAuditSchema },
      { name: SiteAuditJob.name, schema: SiteAuditJobSchema },
    ]),
    ProjectsModule,
  ],
  controllers: [SiteAuditController],
  providers: [SiteAuditService],
})
export class SiteAuditModule {}
