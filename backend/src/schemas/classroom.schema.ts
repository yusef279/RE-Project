import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Classroom extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop()
    gradeLevel: string;

    @Prop({ type: Types.ObjectId, ref: 'TeacherProfile', required: true })
    teacherId: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const ClassroomSchema = SchemaFactory.createForClass(Classroom);

ClassroomSchema.virtual('classroomStudents', {
    ref: 'ClassroomStudent',
    localField: '_id',
    foreignField: 'classroomId',
});
