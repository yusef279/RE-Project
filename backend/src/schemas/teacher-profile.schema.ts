import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class TeacherProfile extends Document {
    @Prop({ required: true })
    fullName: string;

    @Prop()
    phone: string;

    @Prop()
    school: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;
}

export const TeacherProfileSchema = SchemaFactory.createForClass(TeacherProfile);
