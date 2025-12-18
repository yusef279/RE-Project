import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import {
  ActivityEvent,
  ActivityEventSchema,
} from '../schemas/activity-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActivityEvent.name, schema: ActivityEventSchema },
    ]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
