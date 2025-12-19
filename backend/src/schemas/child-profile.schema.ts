import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AgeGroup, getAgeGroup } from '../common/enums/age-group.enum';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class ChildProfile extends Document {
    @Prop({ required: true })
    fullName: string;

    @Prop({ required: true, min: 3, max: 12 })
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

    // Virtual property for age group
    get ageGroup(): AgeGroup {
        return getAgeGroup(this.age);
    }
}

export const ChildProfileSchema = SchemaFactory.createForClass(ChildProfile);

// Add virtual for age group
ChildProfileSchema.virtual('ageGroup').get(function() {
    return getAgeGroup(this.age);
});
