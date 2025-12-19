import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesService } from './games.service';
import { RewardsService } from './rewards.service';
import { LeaderboardService } from './leaderboard.service';
import { ReportService } from './report.service';
import { GamesController } from './games.controller';
import { Game, GameSchema } from '../schemas/game.schema';
import { Badge, BadgeSchema } from '../schemas/badge.schema';
import { GameProgress, GameProgressSchema } from '../schemas/game-progress.schema';
import { ChildBadge, ChildBadgeSchema } from '../schemas/child-badge.schema';
import { ChildProfile, ChildProfileSchema } from '../schemas/child-profile.schema';
import { ActivityEvent, ActivityEventSchema } from '../schemas/activity-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Game.name, schema: GameSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: GameProgress.name, schema: GameProgressSchema },
      { name: ChildBadge.name, schema: ChildBadgeSchema },
      { name: ChildProfile.name, schema: ChildProfileSchema },
      { name: ActivityEvent.name, schema: ActivityEventSchema },
    ]),
  ],
  controllers: [GamesController],
  providers: [GamesService, RewardsService, LeaderboardService, ReportService],
  exports: [GamesService, RewardsService, LeaderboardService, ReportService],
})
export class GamesModule { }
