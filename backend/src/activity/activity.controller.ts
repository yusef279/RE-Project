import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ActivityService } from './activity.service';
import { CreateActivityEventDto } from './dto/create-activity-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

@Controller('api/activity')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @Post('log')
  @Roles(UserRole.PARENT) // Parents log activities for their children
  async logActivity(
    @CurrentUser() user: any,
    @Body() createActivityEventDto: CreateActivityEventDto,
    @Req() request: Request,
  ) {
    // Verify child belongs to parent
    await this.activityService.verifyChildOwnership(
      user.profileId,
      createActivityEventDto.childId,
    );

    const ipAddress = request.ip;
    const userAgent = request.get('user-agent');

    return this.activityService.logActivity(
      createActivityEventDto,
      ipAddress,
      userAgent,
    );
  }

  @Get('child/:childId')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getChildActivities(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
    @Query('limit') limit?: number,
  ) {
    // Verify access: parent can only access their own children
    if (user.role === UserRole.PARENT) {
      await this.activityService.verifyChildOwnership(user.profileId, childId);
    }
    // Teachers and admins can access any child
    return this.activityService.getChildActivities(
      childId,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Get('child/:childId/stats')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getActivityStats(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
  ) {
    // Verify access: parent can only access their own children
    if (user.role === UserRole.PARENT) {
      await this.activityService.verifyChildOwnership(user.profileId, childId);
    }
    // Teachers and admins can access any child
    return this.activityService.getActivityStats(childId);
  }

  @Get('child/:childId/type/:eventType')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getChildActivitiesByType(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
    @Param('eventType') eventType: string,
    @Query('limit') limit?: number,
  ) {
    // Verify access: parent can only access their own children
    if (user.role === UserRole.PARENT) {
      await this.activityService.verifyChildOwnership(user.profileId, childId);
    }
    // Teachers and admins can access any child
    return this.activityService.getChildActivitiesByType(
      childId,
      eventType,
      limit ? parseInt(limit.toString()) : 50,
    );
  }
}
