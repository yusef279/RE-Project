import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { GamesService } from './games.service';
import { RewardsService } from './rewards.service';
import { LeaderboardService } from './leaderboard.service';
import { ReportService } from './report.service';
import { CompleteGameDto } from './dto/complete-game.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../schemas/user.schema';
import { GameType } from '../schemas/game.schema';

@Controller('api/games')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly rewardsService: RewardsService,
    private readonly leaderboardService: LeaderboardService,
    private readonly reportService: ReportService,
  ) { }

  @Get()
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getAllGames(@Query('type') type?: GameType) {
    return this.gamesService.getAllGames(type);
  }

  @Get(':id')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getGame(@Param('id') id: string) {
    return this.gamesService.getGameById(id);
  }

  @Get('child/:childId')
  @Roles(UserRole.PARENT, UserRole.TEACHER)
  async getGamesForChild(@Param('childId') childId: string) {
    return this.gamesService.getGamesForChild(childId);
  }

  @Post('complete')
  @Roles(UserRole.PARENT) // Parents submit on behalf of children
  async completeGame(
    @CurrentUser() user: any,
    @Body() completeGameDto: CompleteGameDto,
  ) {
    // Verify child belongs to parent
    await this.gamesService.verifyChildOwnership(
      user.profileId,
      completeGameDto.childId,
    );

    const result = await this.gamesService.completeGame(completeGameDto);

    // Check for new badges
    const newBadges = await this.rewardsService.checkAndAwardBadges(
      completeGameDto.childId,
    );

    return {
      ...result,
      newBadges,
    };
  }

  @Get('progress/:childId')
  @Roles(UserRole.PARENT, UserRole.TEACHER)
  async getChildProgress(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
  ) {
    // Verify access: parent can only access their own children, teacher can access children in their classrooms
    if (user.role === UserRole.PARENT) {
      await this.gamesService.verifyChildOwnership(user.profileId, childId);
    }
    // Teachers can access any child (they have consent)
    return this.gamesService.getChildProgress(childId);
  }

  @Get('progress/:childId/:gameId')
  @Roles(UserRole.PARENT, UserRole.TEACHER)
  async getGameProgress(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
    @Param('gameId') gameId: string,
  ) {
    // Verify access: parent can only access their own children, teacher can access children in their classrooms
    if (user.role === UserRole.PARENT) {
      await this.gamesService.verifyChildOwnership(user.profileId, childId);
    }
    // Teachers can access any child (they have consent)
    return this.gamesService.getGameProgress(childId, gameId);
  }

  @Get('badges/all')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getAllBadges() {
    return this.rewardsService.getAllBadges();
  }

  @Get('badges/:childId')
  @Roles(UserRole.PARENT, UserRole.TEACHER)
  async getChildBadges(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
  ) {
    // Verify access: parent can only access their own children, teacher can access children in their classrooms
    if (user.role === UserRole.PARENT) {
      await this.gamesService.verifyChildOwnership(user.profileId, childId);
    }
    // Teachers can access any child (they have consent)
    return this.rewardsService.getChildBadges(childId);
  }

  @Get('leaderboard/global')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getGlobalLeaderboard(
    @Query('childId') childId?: string,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.leaderboardService.getGlobalLeaderboard(
      childId,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('leaderboard/game/:gameId')
  @Roles(UserRole.PARENT, UserRole.TEACHER)
  async getGameLeaderboard(
    @Param('gameId') gameId: string,
    @Query('childId') childId?: string,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.leaderboardService.getGameLeaderboard(
      gameId,
      childId,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  @Get('rank/:childId')
  @Roles(UserRole.PARENT, UserRole.TEACHER)
  async getChildRank(@Param('childId') childId: string): Promise<any> {
    return this.leaderboardService.getChildRank(childId);
  }

  @Get('report/:childId')
  @Roles(UserRole.PARENT, UserRole.TEACHER)
  async generateProgressReport(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      // Verify access: parent can only access their own children, teacher can access children in their classrooms
      if (user.role === UserRole.PARENT) {
        await this.gamesService.verifyChildOwnership(user.profileId, childId);
      }
      // Teachers can access any child (they have consent)

      const pdfBuffer = await this.reportService.generateProgressReport(childId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=progress-report-${childId}.pdf`,
      );
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}
