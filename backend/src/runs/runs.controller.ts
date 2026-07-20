import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RunsService } from './runs.service';

@Controller('projects/:projectId')
@UseGuards(JwtAuthGuard)
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post('runs/execute')
  execute(
    @Param('projectId') projectId: string,
    @Body() body: { promptSetId?: string; promptIds?: string[] },
    @CurrentUser() user: AuthUser,
  ) {
    return this.runsService.startExecute(projectId, user, body?.promptSetId, body?.promptIds);
  }

  @Get('runs/jobs/latest')
  latestJob(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.runsService.getLatestJob(projectId, user);
  }

  @Get('overview')
  overview(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.runsService.getOverview(projectId, user);
  }

  @Get('sentiment-stats')
  sentimentStats(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.runsService.getSentimentStats(projectId, user);
  }

  @Get('runs')
  listRecent(
    @Param('projectId') projectId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('platform') platform: 'GEMINI' | 'OPENAI',
    @CurrentUser() user: AuthUser,
  ) {
    return this.runsService.listRecent(projectId, user, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      platform: platform || undefined,
    });
  }
}
