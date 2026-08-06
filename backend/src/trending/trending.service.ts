import { Injectable } from '@nestjs/common';
import { TrendingTopicsService } from '../trending-topics/trending-topics.service';
import { TrendingLang, TrendingPeriod } from './trending-data';

@Injectable()
export class TrendingService {
  constructor(private readonly trendingTopicsService: TrendingTopicsService) {}

  async get(industry: string, period: TrendingPeriod, lang: TrendingLang = 'vi') {
    const items = await this.trendingTopicsService.getEffective(industry, period, lang);
    return { industry, period, lang, items };
  }
}
