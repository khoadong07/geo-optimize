import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TrendingPeriod } from '../trending/trending-data';
import { CreateTrendingTopicDto, CreateTrendingTopicsBulkDto, UpdateTrendingTopicDto } from './dto';
import { TrendingTopicsService } from './trending-topics.service';

@Controller('trending-topics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class TrendingTopicsController {
  constructor(private readonly trendingTopicsService: TrendingTopicsService) {}

  @Get()
  list(@Query('industry') industry?: string, @Query('period') period?: TrendingPeriod) {
    return this.trendingTopicsService.list(industry, period);
  }

  @Get('industries')
  listIndustries() {
    return this.trendingTopicsService.listIndustries();
  }

  @Post()
  create(@Body() body: CreateTrendingTopicDto) {
    return this.trendingTopicsService.create(body);
  }

  @Post('bulk')
  createMany(@Body() body: CreateTrendingTopicsBulkDto) {
    return this.trendingTopicsService.createMany(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateTrendingTopicDto) {
    return this.trendingTopicsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trendingTopicsService.remove(id);
  }
}
