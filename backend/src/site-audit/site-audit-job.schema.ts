import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SiteAuditJobDocument = SiteAuditJob & Document;

@Schema({ timestamps: true })
export class SiteAuditJob {
  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true, enum: ['running', 'completed', 'failed'], default: 'running' })
  status!: 'running' | 'completed' | 'failed';

  @Prop({ type: String, default: null })
  errorMessage!: string | null;

  @Prop({ type: Date, default: null })
  finishedAt!: Date | null;
}

export const SiteAuditJobSchema = SchemaFactory.createForClass(SiteAuditJob);
SiteAuditJobSchema.index({ projectId: 1, createdAt: -1 });
