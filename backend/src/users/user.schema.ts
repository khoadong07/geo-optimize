import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role!: 'admin' | 'user';

  @Prop({ default: false })
  mustChangePassword!: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
