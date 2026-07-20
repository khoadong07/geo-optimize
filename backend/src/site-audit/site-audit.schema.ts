import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SiteAuditDocument = SiteAudit & Document;

@Schema({ timestamps: true })
export class SiteAudit {
  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  score!: number;

  @Prop({ required: true })
  band!: string;

  @Prop({ type: Object, required: true })
  checks!: Record<string, unknown>;

  @Prop({ type: Object, required: true })
  scoreBreakdown!: Record<string, number>;

  @Prop({ type: [String], default: [] })
  recommendations!: string[];

  @Prop({ type: Number, default: null })
  httpStatus!: number | null;

  @Prop({ type: Number, default: null })
  auditDurationMs!: number | null;

  @Prop({ type: String, default: null })
  error!: string | null;
}

export const SiteAuditSchema = SchemaFactory.createForClass(SiteAudit);
SiteAuditSchema.index({ projectId: 1, createdAt: -1 });
