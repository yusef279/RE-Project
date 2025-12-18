import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { ChildProfile, ChildProfileSchema } from '../schemas/child-profile.schema';
import { ParentProfile, ParentProfileSchema } from '../schemas/parent-profile.schema';
import { Consent, ConsentSchema } from '../schemas/consent.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChildProfile.name, schema: ChildProfileSchema },
      { name: ParentProfile.name, schema: ParentProfileSchema },
      { name: Consent.name, schema: ConsentSchema },
    ]),
  ],
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule { }
