import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TrendingPeriod } from '../trending/trending-data';

export type TrendingTopicDocument = TrendingTopic & Document;

@Schema({ timestamps: true })
export class TrendingTopic {
  @Prop({ required: true, trim: true })
  industry!: string;

  @Prop({ required: true, enum: ['week', 'month'] })
  period!: TrendingPeriod;

  @Prop({ required: true, trim: true })
  text!: string;
}

export const TrendingTopicSchema = SchemaFactory.createForClass(TrendingTopic);
TrendingTopicSchema.index({ industry: 1, period: 1 });
