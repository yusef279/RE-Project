import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ThreatDetectionService } from './threat-detection.service';
import { SafetyRulesService } from './safety-rules.service';
import type { CreateSafetyRuleDto } from './safety-rules.service';
import { AdminService } from './admin.service';
import { ParentAlertService } from './parent-alert.service';
import type { AlertStatus } from '../schemas/parent-alert.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../schemas/user.schema';

import { MonitoringService } from './monitoring.service';

@Controller('api/protection')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProtectionController {
  constructor(
    private readonly threatDetectionService: ThreatDetectionService,
    private readonly safetyRulesService: SafetyRulesService,
    private readonly adminService: AdminService,
    private readonly parentAlertService: ParentAlertService,
    private readonly monitoringService: MonitoringService,
  ) { }

  // Parent endpoints
  @Post('safety-rules')
  @Roles(UserRole.PARENT)
  async createSafetyRules(
    @CurrentUser() user: any,
    @Body() dto: CreateSafetyRuleDto,
  ) {
    // Extract parentId from authenticated user
    const parentId = user.profileId;
    
    // Verify child belongs to parent before creating/updating rules
    await this.safetyRulesService.verifyChildOwnership(parentId, dto.childId);
    
    return this.safetyRulesService.createOrUpdateRules({
      ...dto,
      parentId,
    });
  }

  @Get('safety-rules/:childId')
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async getSafetyRules(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
  ) {
    // Verify child belongs to parent (admins can access any)
    if (user.role === UserRole.PARENT) {
      await this.safetyRulesService.verifyChildOwnership(user.profileId, childId);
    }
    return this.safetyRulesService.getRules(childId);
  }

  @Get('threats/child/:childId')
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async getChildThreats(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
    @Query('status') status?: string,
  ) {
    // Verify child belongs to parent (admins can access any)
    if (user.role === UserRole.PARENT) {
      await this.safetyRulesService.verifyChildOwnership(user.profileId, childId);
    }
    return this.threatDetectionService.getChildThreats(childId, status as any);
  }

  @Get('screen-time-status/:childId')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getScreenTimeStatus(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
  ) {
    // Verify access: parent can only access their own children
    if (user.role === UserRole.PARENT) {
      await this.safetyRulesService.verifyChildOwnership(user.profileId, childId);
    }
    // Teachers and admins can access any child
    return this.monitoringService.checkTimeLimit(childId);
  }

  @Get('usage-summary/:childId')
  @Roles(UserRole.PARENT, UserRole.ADMIN)
  async getUsageSummary(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
    @Query('days') days?: number,
  ) {
    // Verify child belongs to parent (admins can access any)
    if (user.role === UserRole.PARENT) {
      await this.safetyRulesService.verifyChildOwnership(user.profileId, childId);
    }
    return this.monitoringService.getUsageSummary(childId, days ? parseInt(days.toString()) : 7);
  }

  // Admin endpoints
  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('admin/activity-trends')
  @Roles(UserRole.ADMIN)
  async getActivityTrends(@Query('days') days?: number) {
    return this.adminService.getActivityTrends(days ? parseInt(days.toString()) : 7);
  }

  @Get('admin/popular-games')
  @Roles(UserRole.ADMIN)
  async getPopularGames(@Query('limit') limit?: number) {
    return this.adminService.getPopularGames(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('admin/threats')
  @Roles(UserRole.ADMIN)
  async getThreatOverview() {
    return this.adminService.getThreatOverview();
  }

  @Get('admin/top-children')
  @Roles(UserRole.ADMIN)
  async getTopChildren(@Query('limit') limit?: number) {
    return this.adminService.getTopChildren(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('admin/users')
  @Roles(UserRole.ADMIN)
  async getAllUsers(@Query('role') role?: string) {
    return this.adminService.getAllUsers(role);
  }

  @Get('admin/recent-activity')
  @Roles(UserRole.ADMIN)
  async getRecentActivity(@Query('limit') limit?: number) {
    return this.adminService.getRecentActivity(limit ? parseInt(limit.toString()) : 50);
  }

  @Patch('admin/threats/:id/resolve')
  @Roles(UserRole.ADMIN)
  async resolveIncident(
    @CurrentUser() user: any,
    @Param('id') incidentId: string,
    @Body() body: { resolution: 'resolved' | 'false_positive'; notes?: string },
  ) {
    return this.threatDetectionService.resolveIncident(
      incidentId,
      user.sub,
      body.resolution,
      body.notes,
    );
  }

  @Get('admin/threat-stats')
  @Roles(UserRole.ADMIN)
  async getThreatStats() {
    return this.threatDetectionService.getThreatStats();
  }

  // Parent Alert endpoints
  @Get('alerts')
  @Roles(UserRole.PARENT)
  async getAlerts(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
  ) {
    return this.parentAlertService.getParentAlerts(
      user.profileId,
      status as AlertStatus,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Get('alerts/unread-count')
  @Roles(UserRole.PARENT)
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.parentAlertService.getUnreadCount(user.profileId);
    return { count };
  }

  @Get('alerts/child/:childId')
  @Roles(UserRole.PARENT)
  async getAlertsByChild(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
    @Query('limit') limit?: number,
  ) {
    // Verify child belongs to parent
    await this.safetyRulesService.verifyChildOwnership(user.profileId, childId);
    
    return this.parentAlertService.getAlertsByChild(
      user.profileId,
      childId,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Patch('alerts/:id/read')
  @Roles(UserRole.PARENT)
  async markAlertAsRead(
    @CurrentUser() user: any,
    @Param('id') alertId: string,
  ) {
    return this.parentAlertService.markAsRead(alertId, user.profileId);
  }

  @Patch('alerts/mark-all-read')
  @Roles(UserRole.PARENT)
  async markAllAlertsAsRead(@CurrentUser() user: any) {
    return this.parentAlertService.markAllAsRead(user.profileId);
  }

  @Patch('alerts/:id/dismiss')
  @Roles(UserRole.PARENT)
  async dismissAlert(
    @CurrentUser() user: any,
    @Param('id') alertId: string,
  ) {
    return this.parentAlertService.dismissAlert(alertId, user.profileId);
  }
}
