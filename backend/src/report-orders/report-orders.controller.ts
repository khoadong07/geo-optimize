import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateReportOrderDto, SetReportOrderStatusDto } from './dto';
import { ReportOrdersService } from './report-orders.service';

@Controller('report-orders')
export class ReportOrdersController {
  constructor(private readonly reportOrdersService: ReportOrdersService) {}

  // Public — submitted from the report checkout flow on the landing page.
  @Post()
  create(@Body() body: CreateReportOrderDto) {
    return this.reportOrdersService.create(body);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.reportOrdersService.getById(id);
  }

  // Public, demo-only: no real payment gateway — simulates a successful
  // VietQR/MoMo/card payment for the checkout flow.
  @Post(':id/simulate-payment')
  simulatePayment(@Param('id') id: string) {
    return this.reportOrdersService.simulatePayment(id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { path, filename } = await this.reportOrdersService.getDownloadPath(id);
    res.download(path, filename, (err) => {
      if (err && !res.headersSent) {
        res.status(404).json({ message: 'Could not download file' });
      }
    });
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
