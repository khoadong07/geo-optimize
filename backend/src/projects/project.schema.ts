import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  ownerId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop()
  industry?: string;

  @Prop({ enum: ['vietnam', 'thailand', 'indonesia', 'international'], default: 'vietnam' })
  zone?: string;

  @Prop()
  domain?: string;

  @Prop({ default: [] })
  competitors: string[] = [];

  @Prop({ default: [] })
  prompts: string[] = [];

  @Prop({ type: [String], enum: ['GEMINI', 'OPENAI'], default: [] })
  enabledPlatforms!: Array<'GEMINI' | 'OPENAI'>;

  @Prop({ default: 75 })
  targetVisibilityScore!: number;

  @Prop({ default: 3 })
  runsPerPrompt!: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
