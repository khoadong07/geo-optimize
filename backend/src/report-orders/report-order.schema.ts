import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportOrderDocument = ReportOrder & Document;
export type ReportOrderStatus = 'new' | 'contacted' | 'fulfilled';

@Schema({ timestamps: true })
export class ReportOrder {
  @Prop({ required: true })
  reportId!: string;

  @Prop({ required: true })
  reportTitle!: string;

  @Prop({ required: true })
  priceVnd!: number;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ default: '' })
  company!: string;

  @Prop({ required: true, enum: ['new', 'contacted', 'fulfilled'], default: 'new' })
  status!: ReportOrderStatus;
}

export const ReportOrderSchema = SchemaFactory.createForClass(ReportOrder);
ReportOrderSchema.index({ createdAt: -1 });
