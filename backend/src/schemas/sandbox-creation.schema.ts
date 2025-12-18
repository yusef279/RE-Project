import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SandboxCreationDocument = SandboxCreation & Document;

@Schema({ timestamps: true })
export class SandboxCreation {
  @Prop({ required: true })
  childId: string;

  @Prop({ required: true })
  sandboxType: string; // 'drawing', 'code', 'story', etc.

  @Prop({ type: Object })
  content: Record<string, any>;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop({ default: false })
  isShared: boolean;

  @Prop({ default: false })
  flaggedForReview: boolean;
}

export const SandboxCreationSchema =
  SchemaFactory.createForClass(SandboxCreation);
