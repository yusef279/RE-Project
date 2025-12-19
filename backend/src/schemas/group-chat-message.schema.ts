import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class GroupChatMessage extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChildProfile', required: true })
  senderId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ default: false })
  isModerated: boolean;

  @Prop({ default: false })
  isFlagged: boolean;

  @Prop()
  flaggedReason?: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const GroupChatMessageSchema = SchemaFactory.createForClass(GroupChatMessage);

// Index for efficient queries
GroupChatMessageSchema.index({ createdAt: -1 });
