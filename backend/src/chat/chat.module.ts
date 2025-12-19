import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage, ChatMessageSchema } from '../schemas/chat-message.schema';
import { GroupChatMessage, GroupChatMessageSchema } from '../schemas/group-chat-message.schema';
import { ChildProfile, ChildProfileSchema } from '../schemas/child-profile.schema';
import { SafetyRule, SafetyRuleSchema } from '../schemas/safety-rule.schema';
import { ThreatIncident, ThreatIncidentSchema } from '../schemas/threat-incident.schema';
import { ParentAlert, ParentAlertSchema } from '../schemas/parent-alert.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: GroupChatMessage.name, schema: GroupChatMessageSchema },
      { name: ChildProfile.name, schema: ChildProfileSchema },
      { name: SafetyRule.name, schema: SafetyRuleSchema },
      { name: ThreatIncident.name, schema: ThreatIncidentSchema },
      { name: ParentAlert.name, schema: ParentAlertSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
