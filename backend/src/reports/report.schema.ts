import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

export const REPORT_CATEGORIES = ['banking', 'fmcg', 'insurance', 'telecom', 'real_estate', 'general'] as const;
export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export type ReportStatus = 'draft' | 'published' | 'coming_soon';

@Schema({ timestamps: true })
export class Report {
  @Prop({ required: true })
  title!: string;

  @Prop({ default: '' })
  subtitle!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true, enum: REPORT_CATEGORIES, default: 'general' })
  category!: ReportCategory;

  @Prop({ required: true, default: 0 })
  priceVnd!: number;

  @Prop({ required: true, enum: ['draft', 'published', 'coming_soon'], default: 'draft' })
  status!: ReportStatus;

  @Prop({ default: '' })
  coverImagePath!: string;

  @Prop({ default: '' })
  filePath!: string;

  @Prop({ default: '' })
  fileOriginalName!: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
ReportSchema.index({ createdAt: -1 });
