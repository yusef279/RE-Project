import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityEvent, ActivityEventDocument } from '../schemas/activity-event.schema';
import { CreateActivityEventDto } from './dto/create-activity-event.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(ActivityEvent.name)
    private activityEventModel: Model<ActivityEventDocument>,
  ) {}

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
    return await this.activityEventModel
      .find({ childId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getChildActivitiesByType(
    childId: string,
    eventType: string,
    limit: number = 50,
  ) {
    return await this.activityEventModel
      .find({ childId, eventType })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getActivityStats(childId: string) {
    const activities = await this.activityEventModel.find({ childId }).exec();

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
    return await this.activityEventModel.deleteMany({ childId }).exec();
  }
}
