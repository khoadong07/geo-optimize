import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrialRequestDocument = TrialRequest & Document;

export type TrialRequestStatus = 'new' | 'contacted' | 'converted';

@Schema({ timestamps: true })
export class TrialRequest {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  company!: string;

  @Prop({ default: '' })
  message!: string;

  @Prop({ required: true, enum: ['new', 'contacted', 'converted'], default: 'new' })
  status!: TrialRequestStatus;

  @Prop({ default: '' })
  accountUsername!: string;

  @Prop({ default: false })
  welcomeEmailSent!: boolean;
}

export const TrialRequestSchema = SchemaFactory.createForClass(TrialRequest);
