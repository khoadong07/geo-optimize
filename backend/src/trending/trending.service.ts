import { Injectable } from '@nestjs/common';
import { TrendingTopicsService } from '../trending-topics/trending-topics.service';
import { TrendingPeriod } from './trending-data';

@Injectable()
export class TrendingService {
  constructor(private readonly trendingTopicsService: TrendingTopicsService) {}

  async get(industry: string, period: TrendingPeriod) {
    const items = await this.trendingTopicsService.getEffective(industry, period);
    return { industry, period, items };
  }
}
