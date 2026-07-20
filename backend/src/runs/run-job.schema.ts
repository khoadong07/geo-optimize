import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RunJobDocument = RunJob & Document;

@Schema({ timestamps: true })
export class RunJob {
  @Prop({ required: true })
  projectId!: string;

  @Prop({ type: String, default: null })
  promptSetId!: string | null;

  @Prop({ required: true, enum: ['running', 'completed', 'failed'], default: 'running' })
  status!: 'running' | 'completed' | 'failed';

  @Prop({ required: true })
  totalJobs!: number;

  @Prop({ default: 0 })
  completedJobs!: number;

  @Prop({ default: 0 })
  failedJobs!: number;

  @Prop({ type: Date, default: null })
  finishedAt!: Date | null;
}

export const RunJobSchema = SchemaFactory.createForClass(RunJob);
RunJobSchema.index({ projectId: 1, createdAt: -1 });
