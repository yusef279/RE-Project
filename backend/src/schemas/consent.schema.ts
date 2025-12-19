import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ConsentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum ConsentType {
    CHILD = 'child',
    CLASSROOM = 'classroom',
}

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Consent extends Document {
    @Prop({ type: String, enum: ConsentType, required: true })
    type: ConsentType;

    @Prop({ type: String, enum: ConsentStatus, default: ConsentStatus.PENDING })
    status: ConsentStatus;

    @Prop({ type: Types.ObjectId, ref: 'ParentProfile', required: true })
    parentId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'TeacherProfile' })
    teacherId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ChildProfile' })
    childId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Classroom' })
    classroomId: Types.ObjectId;

    @Prop()
    message: string;
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);
