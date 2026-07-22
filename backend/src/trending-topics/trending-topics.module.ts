import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrendingTopic, TrendingTopicSchema } from './trending-topic.schema';
import { TrendingTopicsController } from './trending-topics.controller';
import { TrendingTopicsService } from './trending-topics.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: TrendingTopic.name, schema: TrendingTopicSchema }])],
  controllers: [TrendingTopicsController],
  providers: [TrendingTopicsService],
  exports: [TrendingTopicsService],
})
export class TrendingTopicsModule {}
