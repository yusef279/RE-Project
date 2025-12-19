import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SandboxProject extends Document {
    @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
    childId: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ type: Object, required: true })
    canvasData: Record<string, any>; // JSON representation of the creative scene

    @Prop()
    thumbnailUrl: string;

    @Prop({ default: false })
    isShared: boolean;

    @Prop({ default: 'pending' })
    shareStatus: 'pending' | 'approved' | 'rejected';

    @Prop({ type: [String], default: [] })
    sharedWith: string[]; // List of parent-approved contact IDs

    @Prop()
    lastAutoSavedAt: Date;
}

export const SandboxProjectSchema = SchemaFactory.createForClass(SandboxProject);
