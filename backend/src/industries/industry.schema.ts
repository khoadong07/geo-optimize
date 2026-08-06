import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IndustryDocument = Industry & Document;

@Schema({ timestamps: true })
export class Industry {
  // Canonical value stored on Project.industry and used in classification
  // prompts — kept stable even if labels change, so renaming a label doesn't
  // orphan existing projects tagged with the old name.
  @Prop({ required: true, unique: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  labelEn!: string;

  @Prop({ required: true, trim: true })
  labelVi!: string;

  @Prop({ default: 0 })
  order!: number;
}

export const IndustrySchema = SchemaFactory.createForClass(Industry);
IndustrySchema.index({ order: 1 });
