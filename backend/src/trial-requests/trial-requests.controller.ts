import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateTrialRequestDto, SetTrialRequestStatusDto } from './dto';
import { TrialRequestsService } from './trial-requests.service';

@Controller('trial-requests')
export class TrialRequestsController {
  constructor(private readonly trialRequestsService: TrialRequestsService) {}

  // Public — submitted from the marketing landing page, no auth required.
  @Post()
  create(@Body() body: CreateTrialRequestDto) {
    return this.trialRequestsService.create(body.name, body.email, body.company, body.message);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  list() {
    return this.trialRequestsService.list();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setStatus(@Param('id') id: string, @Body() body: SetTrialRequestStatusDto) {
    return this.trialRequestsService.setStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.trialRequestsService.remove(id);
  }
}
