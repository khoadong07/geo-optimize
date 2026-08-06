import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateIndustryDto, UpdateIndustryDto } from './dto';
import { IndustriesService } from './industries.service';

@Controller('industries')
@UseGuards(JwtAuthGuard)
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  // Any authenticated role (admin/user/trial/customer) can read the catalog —
  // it backs select dropdowns in the project wizard and trial setup step.
  @Get()
  list() {
    return this.industriesService.list();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() body: CreateIndustryDto) {
    return this.industriesService.create(body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() body: UpdateIndustryDto) {
    return this.industriesService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.industriesService.remove(id);
  }
}
