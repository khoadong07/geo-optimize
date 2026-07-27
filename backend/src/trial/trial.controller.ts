import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AnalyzeDto, CaptureLeadDto, SetLeadStatusDto, SetupDto } from './dto';
import { TrialService } from './trial.service';

@Controller('trial')
export class TrialController {
  constructor(private readonly trialService: TrialService) {}

  // Public — no account, no lead yet. Fetches the site, detects industry,
  // creates the trial project, and issues a project-scoped token.
  @Post('analyze')
  analyze(@Body() body: AnalyzeDto) {
    return this.trialService.analyze(body.domain, body.zone);
  }

  @Post('projects/:id/setup')
  @UseGuards(JwtAuthGuard)
  setup(@Param('id') id: string, @Body() body: SetupDto, @CurrentUser() user: AuthUser) {
    return this.trialService.setup(id, user, body);
  }

  @Post('projects/:id/lead')
  @UseGuards(JwtAuthGuard)
  captureLead(@Param('id') id: string, @Body() body: CaptureLeadDto, @CurrentUser() user: AuthUser) {
    return this.trialService.captureLead(id, user, { name: body.name, email: body.email, company: body.company || '' });
  }

  @Get('leads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  listLeads() {
    return this.trialService.listLeads();
  }

  @Patch('leads/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setLeadStatus(@Param('id') id: string, @Body() body: SetLeadStatusDto) {
    return this.trialService.setLeadStatus(id, body.status);
  }

  @Delete('leads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  removeLead(@Param('id') id: string) {
    return this.trialService.removeLead(id);
  }
}
