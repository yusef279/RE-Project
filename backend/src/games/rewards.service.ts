import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Badge } from '../schemas/badge.schema';
import { ChildBadge } from '../schemas/child-badge.schema';
import { ChildProfile } from '../schemas/child-profile.schema';
import { GameProgress } from '../schemas/game-progress.schema';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Badge.name)
    private badgeModel: Model<Badge>,
    @InjectModel(ChildBadge.name)
    private childBadgeModel: Model<ChildBadge>,
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    @InjectModel(GameProgress.name)
    private progressModel: Model<GameProgress>,
  ) { }

  async getAllBadges() {
    return await this.badgeModel.find({ isActive: true })
      .sort({ category: 1, name: 1 })
      .exec();
  }

  async getChildBadges(childId: string) {
    return await this.childBadgeModel.find({ childId })
      .populate('badgeId')
      .sort({ earnedAt: -1 })
      .exec();
  }

  async checkAndAwardBadges(childId: string) {
    const child = await this.childModel.findById(childId).exec();
    if (!child) {
      return [];
    }

    const allBadges = await this.badgeModel.find({ isActive: true }).exec();
    const childBadges = await this.getChildBadges(childId);
    const earnedBadgeIds = childBadges.map((cb) => cb.badgeId.toString());

    const newBadges: ChildBadge[] = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge._id.toString())) {
        continue; // Already earned
      }

      const earned = await this.checkBadgeCriteria(childId, badge, child);
      if (earned) {
        const childBadge = new this.childBadgeModel({
          childId,
          badgeId: badge._id,
        });
        await childBadge.save();
        newBadges.push(childBadge);
      }
    }

    return newBadges;
  }

  private async checkBadgeCriteria(
    childId: string,
    badge: Badge,
    child: ChildProfile,
  ): Promise<boolean> {
    const criteria = badge.criteria || {};

    // First Game badge
    if (criteria.type === 'first_game') {
      const progress = await this.progressModel.find({ childId }).exec();
      return progress.some((p) => p.timesCompleted > 0);
    }

    // Points milestone
    if (criteria.type === 'points_milestone') {
      return (child.totalPoints || 0) >= (criteria.points || 0);
    }

    // Games completed
    if (criteria.type === 'games_completed') {
      const progress = await this.progressModel.find({ childId }).exec();
      const totalCompleted = progress.reduce((sum, p) => sum + p.timesCompleted, 0);
      return totalCompleted >= (criteria.count || 0);
    }

    // Perfect score
    if (criteria.type === 'perfect_score') {
      const progress = await this.progressModel.find({ childId }).exec();
      return progress.some((p) => p.highScore >= 100);
    }

    // Streak (daily play)
    if (criteria.type === 'streak') {
      const progress = await this.progressModel.find({ childId }).exec();
      // Simplified: check if played multiple times in recent days
      const recentPlays = progress.filter(
        (p) =>
          p.lastPlayedAt &&
          new Date().getTime() - new Date(p.lastPlayedAt).getTime() <
          7 * 24 * 60 * 60 * 1000,
      );
      return recentPlays.length >= (criteria.days || 5);
    }

    return false;
  }

  async awardCustomBadge(childId: string, badgeId: string) {
    const existing = await this.childBadgeModel.findOne({ childId, badgeId }).exec();

    if (existing) {
      return existing;
    }

    const childBadge = new this.childBadgeModel({
      childId,
      badgeId,
    });

    return await childBadge.save();
  }
}
