import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChildProfile extends Document {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true })
    age: number;

    @Prop({ default: 'ar-EG' })
    locale: string;

    @Prop()
    avatarUrl: string;

    @Prop({ type: Types.ObjectId, ref: 'ParentProfile', required: true })
    parentId: Types.ObjectId;

    @Prop({ default: 0 })
    totalPoints: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const ChildProfileSchema = SchemaFactory.createForClass(ChildProfile);
