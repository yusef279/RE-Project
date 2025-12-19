import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityEventDocument = ActivityEvent & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class ActivityEvent {
  @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
  childId: Types.ObjectId;

  @Prop({ required: true })
  eventType: string; // 'game_start', 'game_complete', 'login', 'logout', etc.

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'Game' })
  gameId?: Types.ObjectId;

  @Prop()
  score?: number;

  @Prop()
  duration?: number; // in seconds

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;
}

export const ActivityEventSchema =
  SchemaFactory.createForClass(ActivityEvent);
