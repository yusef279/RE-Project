import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityEvent } from '../schemas/activity-event.schema';
import { SafetyRule } from '../schemas/safety-rule.schema';
import { ChildProfile } from '../schemas/child-profile.schema';

@Injectable()
export class MonitoringService {
    constructor(
        @InjectModel(ActivityEvent.name)
        private activityModel: Model<ActivityEvent>,
        @InjectModel(SafetyRule.name)
        private safetyRuleModel: Model<SafetyRule>,
        @InjectModel(ChildProfile.name)
        private childModel: Model<ChildProfile>,
    ) { }

    async getDailyScreenTime(childId: string, date: Date = new Date()): Promise<number> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const events = await this.activityModel.find({
            childId,
            createdAt: { $gte: startOfDay, $lte: endOfDay },
        }).exec();

        // Sum up durations (in seconds)
        const totalSeconds = events.reduce((sum, event) => sum + (event.duration || 0), 0);
        return Math.floor(totalSeconds / 60); // Return minutes
    }

    async checkTimeLimit(childId: string): Promise<{
        isExceeded: boolean;
        currentMinutes: number;
        limitMinutes: number;
        remainingMinutes: number;
        shouldWarn: boolean;
    }> {
        const currentMinutes = await this.getDailyScreenTime(childId);
        const rules = await this.safetyRuleModel.findOne({ childId }).exec();

        const limitMinutes = rules?.timeRestrictions?.maxDailyMinutes || 120; // Default 2 hours
        const remainingMinutes = Math.max(0, limitMinutes - currentMinutes);
        const isExceeded = currentMinutes >= limitMinutes;
        const shouldWarn = !isExceeded && remainingMinutes <= 15; // Warn if 15 mins left

        return {
            isExceeded,
            currentMinutes,
            limitMinutes,
            remainingMinutes,
            shouldWarn,
        };
    }

    async getUsageSummary(childId: string, days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const aggregate = await this.activityModel.aggregate([
            {
                $match: {
                    childId,
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        day: { $dayOfMonth: "$createdAt" },
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                    },
                    totalMinutes: { $sum: { $divide: ["$duration", 60] } },
                    sessions: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
        ]);

        return aggregate;
    }
}
