import { Injectable } from '@nestjs/common';
import { getTrending, TrendingPeriod } from './trending-data';

@Injectable()
export class TrendingService {
  get(industry: string, period: TrendingPeriod) {
    return { industry, period, items: getTrending(industry, period) };
  }
}
