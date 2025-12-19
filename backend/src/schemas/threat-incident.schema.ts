import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThreatIncidentDocument = ThreatIncident & Document;

export enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IncidentStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  FALSE_POSITIVE = 'false_positive',
}

@Schema({ timestamps: true })
export class ThreatIncident {
  @Prop({ required: true })
  childId: string;

  @Prop({ required: true })
  threatType: string; // 'inappropriate_content', 'cyberbullying', 'keyword_match', etc.

  @Prop({
    type: String,
    enum: ThreatSeverity,
    required: true,
  })
  severity: ThreatSeverity;

  @Prop({
    type: String,
    enum: IncidentStatus,
    default: IncidentStatus.OPEN,
  })
  status: IncidentStatus;

  @Prop({ type: Number, min: 0, max: 100 })
  confidence: number; // 0-100 confidence score

  @Prop({ type: Object })
  context: Record<string, any>; // Additional context about the threat

  @Prop()
  detectedKeywords?: string[];

  @Prop()
  parentNotified: boolean;

  @Prop()
  parentNotifiedAt?: Date;

  @Prop()
  resolvedBy?: string; // Admin user ID

  @Prop()
  resolvedAt?: Date;

  @Prop()
  resolutionNotes?: string;
}

export const ThreatIncidentSchema =
  SchemaFactory.createForClass(ThreatIncident);
