import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanOrderDocument = PlanOrder & Document;
export type PlanOrderStatus = 'new' | 'paid' | 'contacted' | 'fulfilled';

@Schema({ timestamps: true })
export class PlanOrder {
  @Prop({ required: true })
  orderNumber!: number;

  @Prop({ required: true })
  planSlug!: string;

  @Prop({ required: true })
  planName!: string;

  @Prop({ required: true })
  priceVnd!: number;

  @Prop({ required: true })
  vatVnd!: number;

  @Prop({ required: true })
  totalVnd!: number;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ default: '' })
  company!: string;

  @Prop({ default: '' })
  discountCode!: string;

  @Prop({ required: true, enum: ['new', 'paid', 'contacted', 'fulfilled'], default: 'new' })
  status!: PlanOrderStatus;
}

export const PlanOrderSchema = SchemaFactory.createForClass(PlanOrder);
PlanOrderSchema.index({ createdAt: -1 });
