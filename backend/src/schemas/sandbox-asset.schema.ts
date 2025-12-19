import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SandboxAsset extends Document {
    @Prop({ required: true })
    name: string;

    @Prop()
    type: string; // 'character', 'building', 'animal', 'item'

    @Prop()
    thumbnailUrl: string;

    @Prop({ default: false })
    isEgyptianThemed: boolean;

    @Prop({ default: false })
    isLocked: boolean;

    @Prop()
    unlockCriteriaGameId: string; // ID of the game needed to unlock this
}

export const SandboxAssetSchema = SchemaFactory.createForClass(SandboxAsset);
