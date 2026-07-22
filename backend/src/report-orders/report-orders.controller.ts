import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateReportOrderDto, SetReportOrderStatusDto } from './dto';
import { ReportOrdersService } from './report-orders.service';

@Controller('report-orders')
export class ReportOrdersController {
  constructor(private readonly reportOrdersService: ReportOrdersService) {}

  // Public — submitted from the "Buy & download" flow on the landing page.
  @Post()
  create(@Body() body: CreateReportOrderDto) {
    return this.reportOrdersService.create(body.reportId, body.name, body.email, body.company);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  list() {
    return this.reportOrdersService.list();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setStatus(@Param('id') id: string, @Body() body: SetReportOrderStatusDto) {
    return this.reportOrdersService.setStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.reportOrdersService.remove(id);
  }
}
