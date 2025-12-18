import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SandboxService } from './sandbox.service';
import { SandboxController } from './sandbox.controller';
import { SandboxAsset, SandboxAssetSchema } from '../schemas/sandbox-asset.schema';
import { SandboxProject, SandboxProjectSchema } from '../schemas/sandbox-project.schema';
import { ChildProfile, ChildProfileSchema } from '../schemas/child-profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SandboxAsset.name, schema: SandboxAssetSchema },
            { name: SandboxProject.name, schema: SandboxProjectSchema },
            { name: ChildProfile.name, schema: ChildProfileSchema },
        ]),
    ],
    providers: [SandboxService],
    controllers: [SandboxController],
    exports: [SandboxService],
})
export class SandboxModule { }
