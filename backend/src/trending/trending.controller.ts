import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrendingService } from './trending.service';

@Controller('trending')
@UseGuards(JwtAuthGuard)
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get()
  get(@Query('industry') industry: string, @Query('period') period: string) {
    if (!industry) {
      throw new BadRequestException('Missing "industry" query parameter');
    }
    return this.trendingService.get(industry, period === 'month' ? 'month' : 'week');
  }
}
