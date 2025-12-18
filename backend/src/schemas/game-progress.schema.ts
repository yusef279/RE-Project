import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class GameProgress extends Document {
    @Prop({ type: Types.ObjectId, ref: 'ChildProfile', required: true })
    childId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
    gameId: Types.ObjectId;

    @Prop({ default: 0 })
    timesPlayed: number;

    @Prop({ default: 0 })
    timesCompleted: number;

    @Prop({ default: 0 })
    highScore: number;

    @Prop({ default: 0 })
    totalPoints: number;

    @Prop({ default: 0 })
    averageScore: number;

    @Prop({ default: 0 })
    totalTimeSpent: number;

    @Prop({ default: 'easy' })
    currentDifficulty: string;

    @Prop({ type: Object })
    metadata: Record<string, any>;

    @Prop({ type: [Number], default: [] })
    recentAccuracy: number[];

    @Prop()
    lastPlayedAt: Date;
}

export const GameProgressSchema = SchemaFactory.createForClass(GameProgress);
