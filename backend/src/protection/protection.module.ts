import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThreatDetectionService } from './threat-detection.service';
import { SafetyRulesService } from './safety-rules.service';
import { AdminService } from './admin.service';
import { ParentAlertService } from './parent-alert.service';
import { MonitoringService } from './monitoring.service';
import { ProtectionController } from './protection.controller';
import {
  ThreatIncident,
  ThreatIncidentSchema,
} from '../schemas/threat-incident.schema';
import {
  SafetyRule,
  SafetyRuleSchema,
} from '../schemas/safety-rule.schema';
import {
  ParentAlert,
  ParentAlertSchema,
} from '../schemas/parent-alert.schema';
import {
  ActivityEvent,
  ActivityEventSchema,
} from '../schemas/activity-event.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { ChildProfile, ChildProfileSchema } from '../schemas/child-profile.schema';
import { Game, GameSchema } from '../schemas/game.schema';
import { GameProgress, GameProgressSchema } from '../schemas/game-progress.schema';
import { Badge, BadgeSchema } from '../schemas/badge.schema';
import { Classroom, ClassroomSchema } from '../schemas/classroom.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ThreatIncident.name, schema: ThreatIncidentSchema },
      { name: SafetyRule.name, schema: SafetyRuleSchema },
      { name: ParentAlert.name, schema: ParentAlertSchema },
      { name: ActivityEvent.name, schema: ActivityEventSchema },
      { name: User.name, schema: UserSchema },
      { name: ChildProfile.name, schema: ChildProfileSchema },
      { name: Game.name, schema: GameSchema },
      { name: GameProgress.name, schema: GameProgressSchema },
      { name: Badge.name, schema: BadgeSchema },
      { name: Classroom.name, schema: ClassroomSchema },
    ]),
  ],
  controllers: [ProtectionController],
  providers: [
    ThreatDetectionService,
    SafetyRulesService,
    AdminService,
    ParentAlertService,
    MonitoringService,
  ],
  exports: [
    ThreatDetectionService,
    SafetyRulesService,
    AdminService,
    ParentAlertService,
    MonitoringService,
  ],
})
export class ProtectionModule { }
