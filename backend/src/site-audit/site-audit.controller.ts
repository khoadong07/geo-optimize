import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SiteAuditService } from './site-audit.service';

@Controller('projects/:projectId/site-audit')
@UseGuards(JwtAuthGuard)
export class SiteAuditController {
  constructor(private readonly siteAuditService: SiteAuditService) {}

  @Post('run')
  run(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.siteAuditService.startAudit(projectId, user);
  }

  @Get('jobs/latest')
  latestJob(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.siteAuditService.getLatestJob(projectId, user);
  }

  @Get()
  latestAudit(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.siteAuditService.getLatestAudit(projectId, user);
  }
}
