import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum BadgeCategory {
    ACHIEVEMENT = 'achievement',
    MILESTONE = 'milestone',
    STREAK = 'streak',
    MASTERY = 'mastery',
}

@Schema({ timestamps: true })
export class Badge extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    iconEmoji: string;

    @Prop({ type: String, enum: BadgeCategory, required: true })
    category: BadgeCategory;

    @Prop({ type: Object })
    criteria: Record<string, any>;

    @Prop({ default: true })
    isActive: boolean;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);
