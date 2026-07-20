import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PromptIntent } from '../prompt-sets/prompt-set.schema';

export type RunDocument = Run & Document;

class CompetitorMentionEntry {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  position!: number;
}

@Schema({ timestamps: true })
export class Run {
  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true })
  promptSetId!: string;

  @Prop({ required: true })
  promptText!: string;

  @Prop({ required: true })
  intent!: PromptIntent;

  @Prop({ required: true, enum: ['GEMINI', 'OPENAI'] })
  platform!: 'GEMINI' | 'OPENAI';

  @Prop({ required: true })
  modelName!: string;

  @Prop({ required: true })
  rawResponse!: string;

  @Prop({ default: false })
  brandMentioned!: boolean;

  @Prop({ type: Number, default: null })
  brandMentionPosition!: number | null;

  @Prop({ type: [{ name: String, position: Number }], default: [] })
  competitorsMentioned!: CompetitorMentionEntry[];

  @Prop({ required: true })
  visibilityScore!: number;

  @Prop({ required: true, enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'NOT_APPLICABLE'] })
  sentimentLabel!: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'NOT_APPLICABLE';

  @Prop({ default: '' })
  sentimentReasoning!: string;

  @Prop({ type: [String], default: [] })
  sentimentTopics!: string[];

  @Prop({ default: '' })
  judgeModel!: string;
}

export const RunSchema = SchemaFactory.createForClass(Run);
RunSchema.index({ projectId: 1, createdAt: -1 });
