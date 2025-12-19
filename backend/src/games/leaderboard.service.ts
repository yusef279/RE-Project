import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChildProfile } from '../schemas/child-profile.schema';
import { GameProgress } from '../schemas/game-progress.schema';

interface LeaderboardEntry {
  rank: number;
  displayName: string; // Anonymized for privacy
  points: number;
  isCurrentChild: boolean;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    @InjectModel(GameProgress.name)
    private progressModel: Model<GameProgress>,
  ) { }

  async getGlobalLeaderboard(
    currentChildId?: string,
    limit: number = 10,
  ): Promise<LeaderboardEntry[]> {
    const children = await this.childModel.find({ isActive: true })
      .sort({ totalPoints: -1 })
      .limit(limit)
      .exec();

    return children.map((child, index) => ({
      rank: index + 1,
      displayName: this.anonymizeName(child.fullName, (child._id as any).toString(), currentChildId),
      points: child.totalPoints,
      isCurrentChild: (child._id as any).toString() === currentChildId,
    }));
  }

  async getGameLeaderboard(
    gameId: string,
    currentChildId?: string,
    limit: number = 10,
  ): Promise<LeaderboardEntry[]> {
    const progress = await this.progressModel.find({ gameId })
      .populate('childId')
      .sort({ highScore: -1 })
      .limit(limit)
      .exec();

    return progress.map((p: any, index: number) => ({
      rank: index + 1,
      displayName: this.anonymizeName(
        p.childId?.fullName || 'Anonymous',
        p.childId?._id?.toString() || '',
        currentChildId,
      ),
      points: p.highScore,
      isCurrentChild: p.childId?._id?.toString() === currentChildId,
    }));
  }

  async getChildRank(childId: string): Promise<{ rank: number; total: number }> {
    const child = await this.childModel.findById(childId).exec();
    if (!child) {
      return { rank: 0, total: 0 };
    }

    const higherRanked = await this.childModel.countDocuments({
      isActive: true,
      totalPoints: { $gt: child.totalPoints },
    });

    const total = await this.childModel.countDocuments({ isActive: true });

    return { rank: higherRanked + 1, total };
  }

  private anonymizeName(
    fullName: string,
    childId: string,
    currentChildId?: string,
  ): string {
    // Show full name only for current child, otherwise anonymize
    if (childId === currentChildId) {
      return fullName;
    }

    // Privacy-safe: Show first name + first letter of last name
    const parts = fullName.split(' ');
    if (parts.length === 1) {
      return parts[0];
    }

    const firstName = parts[0];
    const lastInitial = parts[parts.length - 1][0];
    return `${firstName} ${lastInitial}.`;
  }
}
