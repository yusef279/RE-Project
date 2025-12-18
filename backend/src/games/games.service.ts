import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameType } from '../schemas/game.schema';
import { GameProgress } from '../schemas/game-progress.schema';
import { ChildProfile } from '../schemas/child-profile.schema';
import { ActivityEvent } from '../schemas/activity-event.schema';
import { CompleteGameDto } from './dto/complete-game.dto';

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(Game.name)
    private gameModel: Model<Game>,
    @InjectModel(GameProgress.name)
    private progressModel: Model<GameProgress>,
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
    @InjectModel(ActivityEvent.name)
    private activityEventModel: Model<ActivityEvent>,
  ) { }

  async getAllGames(type?: GameType) {
    const filter: any = { isActive: true };
    if (type) {
      filter.type = type;
    }
    return await this.gameModel.find(filter)
      .sort({ title: 1 })
      .exec();
  }

  async getGameById(id: string) {
    const game = await this.gameModel.findById(id).exec();
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  async getGamesForChild(childId: string) {
    const child = await this.childModel.findById(childId).exec();
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    const games = await this.gameModel.find({
      isActive: true,
      minAge: { $lte: child.age },
      maxAge: { $gte: child.age },
    })
      .sort({ isEgyptianThemed: -1, title: 1 })
      .exec();

    return games;
  }

  async completeGame(completeGameDto: CompleteGameDto) {
    const { childId, gameId, score, duration, accuracyPercent, metadata } = completeGameDto;

    // Verify child and game exist
    const child = await this.childModel.findById(childId).exec();
    if (!child) {
      throw new NotFoundException('Child not found');
    }

    const game = await this.gameModel.findById(gameId).exec();
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    // Find or create progress record
    let progress = await this.progressModel.findOne({ childId, gameId }).exec();

    if (!progress) {
      progress = new this.progressModel({
        childId,
        gameId,
        timesPlayed: 0,
        timesCompleted: 0,
        highScore: 0,
        totalPoints: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        currentDifficulty: 'easy',
      });
    }

    // Update progress
    progress.timesPlayed += 1;
    progress.timesCompleted += 1;
    progress.highScore = Math.max(progress.highScore, score);
    progress.totalPoints += score;
    progress.totalTimeSpent += duration;
    progress.averageScore = progress.totalPoints / progress.timesCompleted;
    progress.lastPlayedAt = new Date();

    // Adaptive difficulty (AC-05.2: 3 consecutive results)
    if (accuracyPercent !== undefined) {
      if (!progress.recentAccuracy) progress.recentAccuracy = [];
      progress.recentAccuracy.push(accuracyPercent);
      if (progress.recentAccuracy.length > 3) {
        progress.recentAccuracy.shift();
      }

      if (progress.recentAccuracy.length === 3) {
        const lastThree = progress.recentAccuracy;
        const allHigh = lastThree.every(acc => acc >= 80);
        const allLow = lastThree.every(acc => acc < 50);

        if (allHigh) {
          if (progress.currentDifficulty === 'easy') progress.currentDifficulty = 'medium';
          else if (progress.currentDifficulty === 'medium') progress.currentDifficulty = 'hard';
          // If already hard, stay hard. Clear history on change to prevent immediate jump
          if (allHigh) progress.recentAccuracy = [];
        } else if (allLow) {
          if (progress.currentDifficulty === 'hard') progress.currentDifficulty = 'medium';
          else if (progress.currentDifficulty === 'medium') progress.currentDifficulty = 'easy';
          if (allLow) progress.recentAccuracy = [];
        }
      }
    }

    if (metadata) {
      progress.metadata = { ...progress.metadata, ...metadata };
    }

    await progress.save();

    // Update child total points
    child.totalPoints += score;
    await child.save();

    // Log activity
    await this.activityEventModel.create({
      childId,
      eventType: 'game_complete',
      gameId,
      score,
      duration,
      metadata: {
        accuracy: accuracyPercent,
        difficulty: progress.currentDifficulty,
        ...metadata,
      },
    });

    return {
      progress,
      pointsEarned: score,
      totalPoints: child.totalPoints,
      newDifficulty: progress.currentDifficulty,
    };
  }

  async getChildProgress(childId: string) {
    return await this.progressModel.find({ childId })
      .populate('gameId')
      .sort({ lastPlayedAt: -1 })
      .exec();
  }

  async getGameProgress(childId: string, gameId: string) {
    return await this.progressModel.findOne({ childId, gameId })
      .populate('gameId')
      .exec();
  }
}
