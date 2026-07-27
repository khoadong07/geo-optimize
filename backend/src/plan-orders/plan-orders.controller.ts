import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreatePlanOrderDto, SetPlanOrderStatusDto } from './dto';
import { PlanOrdersService } from './plan-orders.service';

@Controller('plan-orders')
export class PlanOrdersController {
  constructor(private readonly planOrdersService: PlanOrdersService) {}

  // Public — submitted from the plan checkout flow on the landing/trial pages.
  @Post()
  create(@Body() body: CreatePlanOrderDto) {
    return this.planOrdersService.create(body);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.planOrdersService.getById(id);
  }

  // Public, demo-only: no real payment gateway — simulates a successful
  // VietQR/MoMo/card payment for the checkout flow.
  @Post(':id/simulate-payment')
  simulatePayment(@Param('id') id: string) {
    return this.planOrdersService.simulatePayment(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  list() {
    return this.planOrdersService.list();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  setStatus(@Param('id') id: string, @Body() body: SetPlanOrderStatusDto) {
    return this.planOrdersService.setStatus(id, body.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.planOrdersService.remove(id);
  }
}
