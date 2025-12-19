import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ParentAlertDocument = ParentAlert & Document;

export enum AlertType {
  THREAT_DETECTED = 'threat_detected',
  TIME_LIMIT_EXCEEDED = 'time_limit_exceeded',
  BLOCKED_CONTENT = 'blocked_content',
  CONSENT_REQUEST = 'consent_request',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  UNREAD = 'unread',
  READ = 'read',
  DISMISSED = 'dismissed',
}

@Schema({ timestamps: true })
export class ParentAlert {
  @Prop({ required: true })
  parentId: string;

  @Prop({ required: true })
  childId: string;

  @Prop({ required: true, enum: AlertType })
  type: AlertType;

  @Prop({ required: true, enum: AlertSeverity })
  severity: AlertSeverity;

  @Prop({ required: true, enum: AlertStatus, default: AlertStatus.UNREAD })
  status: AlertStatus;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  relatedIncidentId?: string;

  @Prop()
  readAt?: Date;

  @Prop()
  dismissedAt?: Date;
}

export const ParentAlertSchema = SchemaFactory.createForClass(ParentAlert);
