import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PromptEntry, PromptIntent } from './prompt-set.schema';
import { PromptSetsService } from './prompt-sets.service';

@Controller('projects/:projectId/prompt-sets')
@UseGuards(JwtAuthGuard)
export class PromptSetsController {
  constructor(private readonly promptSetsService: PromptSetsService) {}

  @Get()
  list(@Param('projectId') projectId: string, @CurrentUser() user: AuthUser) {
    return this.promptSetsService.listByProject(projectId, user);
  }

  @Post()
  create(
    @Param('projectId') projectId: string,
    @Body() body: { name: string; prompts?: PromptEntry[] },
    @CurrentUser() user: AuthUser,
  ) {
    return this.promptSetsService.create(projectId, body.name, body.prompts || [], user);
  }

  @Post('generate')
  generate(
    @Param('projectId') projectId: string,
    @Body() body: { intent: PromptIntent; trendingTopics?: string[] },
    @CurrentUser() user: AuthUser,
  ) {
    return this.promptSetsService.generateCandidates(projectId, body.intent, user, body.trendingTopics);
  }

  @Get(':id')
  get(@Param('projectId') projectId: string, @Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.promptSetsService.getById(projectId, id, user);
  }

  @Delete(':id')
  remove(@Param('projectId') projectId: string, @Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.promptSetsService.remove(projectId, id, user);
  }

  @Patch(':id/prompts/:promptId')
  updatePrompt(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('promptId') promptId: string,
    @Body() body: { text?: string; intent?: PromptIntent },
    @CurrentUser() user: AuthUser,
  ) {
    return this.promptSetsService.updatePrompt(projectId, id, promptId, body, user);
  }

  @Delete(':id/prompts/:promptId')
  removePrompt(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @Param('promptId') promptId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.promptSetsService.removePrompt(projectId, id, promptId, user);
  }
}
