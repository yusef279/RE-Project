import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ActivityEvent, ActivityEventDocument } from '../schemas/activity-event.schema';
import { CreateActivityEventDto } from './dto/create-activity-event.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(ActivityEvent.name)
    private activityEventModel: Model<ActivityEventDocument>,
  ) { }

  async logActivity(
    createActivityEventDto: CreateActivityEventDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const activityEvent = new this.activityEventModel({
      ...createActivityEventDto,
      ipAddress,
      userAgent,
    });

    return await activityEvent.save();
  }

  async getChildActivities(childId: string, limit: number = 50) {
    const query = {
      childId: Types.ObjectId.isValid(childId) ? new Types.ObjectId(childId) : childId
    };
    return await this.activityEventModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getChildActivitiesByType(
    childId: string,
    eventType: string,
    limit: number = 50,
  ) {
    const query = {
      childId: Types.ObjectId.isValid(childId) ? new Types.ObjectId(childId) : childId,
      eventType
    };
    return await this.activityEventModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getActivityStats(childId: string) {
    const query = {
      childId: Types.ObjectId.isValid(childId) ? new Types.ObjectId(childId) : childId
    };
    const activities = await this.activityEventModel.find(query as any).exec();

    const stats = {
      totalActivities: activities.length,
      byEventType: {} as Record<string, number>,
      totalScore: 0,
      totalDuration: 0,
      gamesPlayed: 0,
    };

    activities.forEach((activity) => {
      // Count by event type
      stats.byEventType[activity.eventType] =
        (stats.byEventType[activity.eventType] || 0) + 1;

      // Sum scores
      if (activity.score) {
        stats.totalScore += activity.score;
      }

      // Sum duration
      if (activity.duration) {
        stats.totalDuration += activity.duration;
      }

      // Count games
      if (activity.eventType === 'game_complete') {
        stats.gamesPlayed++;
      }
    });

    return stats;
  }

  async deleteChildActivities(childId: string): Promise<any> {
    const query = {
      childId: Types.ObjectId.isValid(childId) ? new Types.ObjectId(childId) : childId
    };
    return await this.activityEventModel.deleteMany(query as any).exec();
  }
}
