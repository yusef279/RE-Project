import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ChatMessage extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChildProfile', required: true })
  senderId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChildProfile', required: true })
  receiverId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isModerated: boolean;

  @Prop({ default: false })
  isFlagged: boolean;

  @Prop()
  flaggedReason?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  readAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// Index for efficient queries
ChatMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
ChatMessageSchema.index({ receiverId: 1, isRead: 1 });
