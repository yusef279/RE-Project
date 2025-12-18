import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClassroomStudent extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Classroom', required: true })
    classroomId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
    childId: Types.ObjectId;

    @Prop({ default: Date.now })
    enrolledAt: Date;
}

export const ClassroomStudentSchema = SchemaFactory.createForClass(ClassroomStudent);
