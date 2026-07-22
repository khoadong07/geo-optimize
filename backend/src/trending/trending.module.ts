import { Module } from '@nestjs/common';
import { TrendingTopicsModule } from '../trending-topics/trending-topics.module';
import { TrendingController } from './trending.controller';
import { TrendingService } from './trending.service';

@Module({
  imports: [TrendingTopicsModule],
  controllers: [TrendingController],
  providers: [TrendingService],
})
export class TrendingModule {}
