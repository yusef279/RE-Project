import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum GameType {
    PLAY = 'play',
    LEARN = 'learn',
}

export enum GameCategory {
    MEMORY = 'memory',
    PUZZLE = 'puzzle',
    QUIZ = 'quiz',
    MATH = 'math',
    LANGUAGE = 'language',
    CREATIVE = 'creative',
}

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Game extends Document {
    @Prop({ required: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ type: String, enum: GameType, required: true })
    type: GameType;

    @Prop({ type: String, enum: GameCategory, required: true })
    category: GameCategory;

    @Prop()
    iconEmoji: string;

    @Prop({ default: 3 })
    minAge: number;

    @Prop({ default: 12 })
    maxAge: number;

    @Prop({ default: 10 })
    basePoints: number;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isEgyptianThemed: boolean;

    @Prop({ type: [String], default: [] })
    culturalThemes: string[];

    @Prop({ type: [String], default: [] })
    iconBadges: string[];

    @Prop({ type: Object })
    config: Record<string, any>;
}

export const GameSchema = SchemaFactory.createForClass(Game);
