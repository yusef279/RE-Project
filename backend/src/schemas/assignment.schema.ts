import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Assignment extends Document {
    @Prop({ type: Types.ObjectId, ref: 'TeacherProfile', required: true })
    teacherId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Classroom', required: true })
    classroomId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
    gameId: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'ChildProfile', default: [] })
    assignedStudentIds: Types.ObjectId[];

    @Prop()
    dueDate: Date;

    @Prop()
    message: string;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
