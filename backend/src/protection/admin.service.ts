import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { ChildProfile } from '../schemas/child-profile.schema';
import { Game } from '../schemas/game.schema';
import { GameProgress } from '../schemas/game-progress.schema';
import { Badge } from '../schemas/badge.schema';
import { Classroom } from '../schemas/classroom.schema';
import {
  ActivityEvent,
} from '../schemas/activity-event.schema';
import {
  ThreatIncident,
} from '../schemas/threat-incident.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    @InjectModel(Game.name)
    private gameModel: Model<Game>,
    @InjectModel(GameProgress.name)
    private progressModel: Model<GameProgress>,
    @InjectModel(Badge.name)
    private badgeModel: Model<Badge>,
    @InjectModel(Classroom.name)
    private classroomModel: Model<Classroom>,
    @InjectModel(ActivityEvent.name)
    private activityModel: Model<ActivityEvent>,
    @InjectModel(ThreatIncident.name)
    private threatModel: Model<ThreatIncident>,
  ) { }

  async getSystemStats(): Promise<any> {
    const [
      totalUsers,
      totalChildren,
      totalGames,
      totalClassrooms,
      totalActivityEvents,
      totalThreats,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.childModel.countDocuments(),
      this.gameModel.countDocuments(),
      this.classroomModel.countDocuments(),
      this.activityModel.countDocuments(),
      this.threatModel.countDocuments(),
    ]);

    // User breakdown by role
    const usersByRole = await this.userModel.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Game completions
    const gameCompletions = await this.progressModel.aggregate([
      { $group: { _id: null, total: { $sum: '$timesCompleted' } } }
    ]);

    // Total points across all children
    const totalPoints = await this.childModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPoints' } } }
    ]);

    return {
      users: {
        total: totalUsers,
        byRole: usersByRole.map(r => ({ role: r._id, count: r.count })),
      },
      children: totalChildren,
      games: totalGames,
      classrooms: totalClassrooms,
      activity: {
        totalEvents: totalActivityEvents,
      },
      gameplay: {
        totalCompletions: gameCompletions[0]?.total || 0,
        totalPoints: totalPoints[0]?.total || 0,
      },
      security: {
        totalThreats: totalThreats,
      },
    };
  }

  async getActivityTrends(days = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyActivity = await this.activityModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          count: { $sum: 1 },
          uniqueChildren: { $addToSet: '$childId' },
        },
      },
      {
        $project: {
          date: '$_id',
          eventCount: '$count',
          uniqueChildren: { $size: '$uniqueChildren' },
        },
      },
      { $sort: { date: 1 } },
    ]);

    return dailyActivity;
  }

  async getPopularGames(limit = 10): Promise<any> {
    const popularGames = await this.progressModel.aggregate([
      {
        $group: {
          _id: '$gameId',
          totalPlays: { $sum: '$timesCompleted' },
          avgScore: { $avg: '$highScore' },
          uniquePlayers: { $addToSet: '$childId' },
        }
      },
      { $sort: { totalPlays: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'games',
          localField: '_id',
          foreignField: '_id',
          as: 'game'
        }
      },
      { $unwind: '$game' },
      {
        $project: {
          gameId: '$_id',
          title: '$game.title',
          icon: '$game.iconEmoji',
          totalPlays: 1,
          avgScore: { $round: ['$avgScore', 0] },
          uniquePlayers: { $size: '$uniquePlayers' },
        }
      }
    ]);

    return popularGames;
  }

  async getThreatOverview(): Promise<any> {
    const [openThreats, resolvedThreats, criticalThreats] = await Promise.all([
      this.threatModel.countDocuments({ status: 'open' }),
      this.threatModel.countDocuments({ status: 'resolved' }),
      this.threatModel.countDocuments({ severity: 'critical' }),
    ]);

    const threatsByType = await this.threatModel.aggregate([
      {
        $group: {
          _id: '$threatType',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const recentThreats = await this.threatModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .exec();

    return {
      summary: {
        open: openThreats,
        resolved: resolvedThreats,
        critical: criticalThreats,
      },
      byType: threatsByType,
      recent: recentThreats,
    };
  }

  async getTopChildren(limit = 10): Promise<any> {
    return await this.childModel.find()
      .sort({ totalPoints: -1 })
      .limit(limit)
      .populate({
        path: 'parentId',
        populate: { path: 'userId' }
      })
      .exec();
  }

  async getAllUsers(role?: string): Promise<User[]> {
    const query: any = {};
    if (role) {
      query.role = role;
    }

    return await this.userModel.find(query)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getRecentActivity(limit = 50): Promise<any> {
    return await this.activityModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}
