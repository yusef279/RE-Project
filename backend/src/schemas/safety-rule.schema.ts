import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SafetyRuleDocument = SafetyRule & Document;

@Schema({ timestamps: true })
export class SafetyRule {
  @Prop({ required: true })
  childId: string;

  @Prop({ required: true })
  parentId: string;

  @Prop({ type: Object, default: {} })
  timeRestrictions: {
    enabled: boolean;
    weekdayStart?: string; // "08:00"
    weekdayEnd?: string; // "20:00"
    weekendStart?: string;
    weekendEnd?: string;
    maxDailyMinutes?: number;
  };

  @Prop({ type: [String], default: [] })
  blockedKeywords: string[];

  @Prop({ type: [String], default: [] })
  blockedUrls: string[];

  @Prop({ type: Object, default: {} })
  contentFilters: {
    blockViolence: boolean;
    blockInappropriate: boolean;
    safeSearchOnly: boolean;
  };

  @Prop({ type: Object, default: {} })
  alertSettings: {
    notifyOnThreat: boolean;
    notifyOnBlockedContent: boolean;
    notifyOnTimeLimit: boolean;
    emailAlerts: boolean;
  };

  @Prop({ default: true })
  isActive: boolean;
}

export const SafetyRuleSchema = SchemaFactory.createForClass(SafetyRule);
