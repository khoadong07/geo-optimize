import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrialLeadDocument = TrialLead & Document;

export type TrialLeadStatus = 'new' | 'contacted' | 'converted';

@Schema({ timestamps: true })
export class TrialLead {
  @Prop({ required: true })
  projectId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ default: '' })
  company!: string;

  @Prop({ required: true, enum: ['new', 'contacted', 'converted'], default: 'new' })
  status!: TrialLeadStatus;

  @Prop({ default: false })
  previewEmailSent!: boolean;
}

export const TrialLeadSchema = SchemaFactory.createForClass(TrialLead);
