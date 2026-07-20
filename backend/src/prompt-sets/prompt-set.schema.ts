import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromptIntent = 'Discovery' | 'Comparison' | 'Branded' | 'Long-tail';

export const PROMPT_INTENTS: PromptIntent[] = ['Discovery', 'Comparison', 'Branded', 'Long-tail'];

export class PromptEntry {
  @Prop({ required: true })
  text!: string;

  @Prop({ required: true, enum: PROMPT_INTENTS, default: 'Discovery' })
  intent!: PromptIntent;
}

export type PromptSetDocument = PromptSet & Document;

@Schema({ timestamps: true })
export class PromptSet {
  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true })
  createdBy!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: [{ text: String, intent: { type: String, enum: PROMPT_INTENTS } }], default: [] })
  prompts!: PromptEntry[];
}

export const PromptSetSchema = SchemaFactory.createForClass(PromptSet);
