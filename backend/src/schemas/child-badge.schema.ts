import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChildBadge extends Document {
    @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
    childId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Badge', required: true })
    badgeId: Types.ObjectId;

    @Prop({ default: Date.now })
    earnedAt: Date;
}

export const ChildBadgeSchema = SchemaFactory.createForClass(ChildBadge);
