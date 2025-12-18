import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class ParentProfile extends Document {
    @Prop({ required: true })
    fullName: string;

    @Prop()
    phone: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;
}

export const ParentProfileSchema = SchemaFactory.createForClass(ParentProfile);
