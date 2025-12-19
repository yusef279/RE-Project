import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import {
  ActivityEvent,
  ActivityEventSchema,
} from '../schemas/activity-event.schema';
import { ChildProfile, ChildProfileSchema } from '../schemas/child-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityEvent.name, schema: ActivityEventSchema },
      { name: ChildProfile.name, schema: ChildProfileSchema },
    ]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
