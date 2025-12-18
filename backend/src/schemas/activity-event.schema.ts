import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivityEventDocument = ActivityEvent & Document;

@Schema({ timestamps: true })
export class ActivityEvent {
  @Prop({ required: true })
  childId: string;

  @Prop({ required: true })
  eventType: string; // 'game_start', 'game_complete', 'login', 'logout', etc.

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop()
  gameId?: string;

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
