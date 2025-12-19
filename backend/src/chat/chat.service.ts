import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from '../schemas/chat-message.schema';
import { GroupChatMessage } from '../schemas/group-chat-message.schema';
import { ChildProfile } from '../schemas/child-profile.schema';
import { SafetyRule } from '../schemas/safety-rule.schema';
import { ThreatIncident } from '../schemas/threat-incident.schema';
import { ParentAlert } from '../schemas/parent-alert.schema';

@Injectable()
export class ChatService {
  // List of inappropriate words to filter (basic example)
  private readonly inappropriateWords = [
    'bad', 'hate', 'stupid', 'idiot', 'dumb',
    // Add more words as needed
  ];

  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(GroupChatMessage.name) private groupChatMessageModel: Model<GroupChatMessage>,
    @InjectModel(ChildProfile.name) private childProfileModel: Model<ChildProfile>,
    @InjectModel(SafetyRule.name) private safetyRuleModel: Model<SafetyRule>,
    @InjectModel(ThreatIncident.name) private threatIncidentModel: Model<ThreatIncident>,
    @InjectModel(ParentAlert.name) private parentAlertModel: Model<ParentAlert>,
  ) {}

  /**
   * Send a message from one child to another with content moderation
   */
  async sendMessage(senderId: string, receiverId: string, content: string): Promise<ChatMessage> {
    // Validate both children exist
    const sender = await this.childProfileModel.findById(senderId);
    const receiver = await this.childProfileModel.findById(receiverId);

    if (!sender || !receiver) {
      throw new NotFoundException('Sender or receiver not found');
    }

    // Check if content is empty
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    // Check for blocked keywords from safety rules
    const senderSafetyRules = await this.safetyRuleModel.findOne({ childId: senderId });
    const receiverSafetyRules = await this.safetyRuleModel.findOne({ childId: receiverId });

    const blockedKeywords = [
      ...(senderSafetyRules?.blockedKeywords || []),
      ...(receiverSafetyRules?.blockedKeywords || []),
      ...this.inappropriateWords,
    ];

    // Check for inappropriate content
    const { isFlagged, flaggedReason } = this.moderateContent(content, blockedKeywords);

    // Create the message
    const message = new this.chatMessageModel({
      senderId,
      receiverId,
      content,
      isRead: false,
      isModerated: true,
      isFlagged,
      flaggedReason,
    });

    await message.save();

    // If content is flagged, create threat incident and alert parents
    if (isFlagged && flaggedReason) {
      await this.createThreatIncident(senderId, receiverId, content, flaggedReason);
    }

    return message;
  }

  /**
   * Get conversation between two children
   */
  async getConversation(childId1: string, childId2: string, limit: number = 50): Promise<ChatMessage[]> {
    return this.chatMessageModel
      .find({
        $or: [
          { senderId: childId1, receiverId: childId2 },
          { senderId: childId2, receiverId: childId1 },
        ],
      } as any)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'fullName')
      .populate('receiverId', 'fullName')
      .exec();
  }

  /**
   * Get list of children the current child has chatted with
   */
  async getChatList(childId: string): Promise<any[]> {
    const messages = await this.chatMessageModel
      .find({
        $or: [{ senderId: childId }, { receiverId: childId }],
      } as any)
      .sort({ createdAt: -1 })
      .populate('senderId', 'fullName')
      .populate('receiverId', 'fullName')
      .exec();

    // Get unique children
    const chatPartners = new Map();

    for (const msg of messages) {
      const senderIdStr = (msg.senderId as any)?._id?.toString() || msg.senderId.toString();
      const receiverIdStr = (msg.receiverId as any)?._id?.toString() || msg.receiverId.toString();

      const partnerId = senderIdStr === childId ? receiverIdStr : senderIdStr;

      if (!chatPartners.has(partnerId)) {
        const partner = senderIdStr === childId ? msg.receiverId : msg.senderId;

        // Count unread messages
        const unreadCount = await this.chatMessageModel.countDocuments({
          senderId: partnerId,
          receiverId: childId,
          isRead: false,
        } as any);

        chatPartners.set(partnerId, {
          id: (partner as any)?._id || partner,
          fullName: (partner as any)?.fullName || 'Unknown',
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount,
          isFlagged: msg.isFlagged,
        });
      }
    }

    return Array.from(chatPartners.values());
  }

  /**
   * Get all children available for chatting (excluding current child)
   */
  async getAvailableChildren(currentChildId: string): Promise<ChildProfile[]> {
    return this.childProfileModel
      .find({ _id: { $ne: currentChildId } })
      .select('fullName age totalPoints')
      .sort({ fullName: 1 })
      .exec();
  }

  /**
   * Mark messages as read
   */
  async markAsRead(receiverId: string, senderId: string): Promise<void> {
    await this.chatMessageModel.updateMany(
      { senderId, receiverId, isRead: false } as any,
      { isRead: true, readAt: new Date() }
    );
  }

  /**
   * Get unread message count for a child
   */
  async getUnreadCount(childId: string): Promise<number> {
    return this.chatMessageModel.countDocuments({
      receiverId: childId,
      isRead: false,
    } as any);
  }

  /**
   * Moderate content for inappropriate words
   */
  private moderateContent(content: string, blockedKeywords: string[]): { isFlagged: boolean; flaggedReason?: string } {
    const lowerContent = content.toLowerCase();

    for (const keyword of blockedKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        return {
          isFlagged: true,
          flaggedReason: `Message contains blocked keyword: "${keyword}"`,
        };
      }
    }

    return { isFlagged: false };
  }

  /**
   * Create threat incident and alert parents when inappropriate content is detected
   */
  private async createThreatIncident(senderId: string, receiverId: string, content: string, reason: string): Promise<void> {
    const sender = await this.childProfileModel.findById(senderId).populate('parentId');
    const receiver = await this.childProfileModel.findById(receiverId).populate('parentId');

    // Create threat incident for sender
    const senderThreat = new this.threatIncidentModel({
      childId: senderId,
      type: 'inappropriate_chat',
      severity: 'medium',
      description: `Inappropriate message sent: ${content}`,
      metadata: { receiverId, content, reason },
      status: 'open',
    });
    await senderThreat.save();

    // Create threat incident for receiver
    const receiverThreat = new this.threatIncidentModel({
      childId: receiverId,
      type: 'inappropriate_chat',
      severity: 'medium',
      description: `Inappropriate message received: ${content}`,
      metadata: { senderId, content, reason },
      status: 'open',
    });
    await receiverThreat.save();

    // Alert sender's parent
    if (sender && sender.parentId) {
      const senderAlert = new this.parentAlertModel({
        parentId: sender.parentId,
        childId: senderId,
        type: 'inappropriate_content',
        severity: 'medium',
        title: '⚠️ Inappropriate Chat Content',
        message: `${sender.fullName} sent a message with inappropriate content.`,
        metadata: { content, reason, receiverId },
        isRead: false,
      });
      await senderAlert.save();
    }

    // Alert receiver's parent
    if (receiver && receiver.parentId) {
      const receiverAlert = new this.parentAlertModel({
        parentId: receiver.parentId,
        childId: receiverId,
        type: 'inappropriate_content',
        severity: 'medium',
        title: '⚠️ Inappropriate Chat Content',
        message: `${receiver.fullName} received a message with inappropriate content.`,
        metadata: { content, reason, senderId },
        isRead: false,
      });
      await receiverAlert.save();
    }
  }

  /**
   * Send a message to the group chat
   */
  async sendGroupMessage(senderId: string, content: string): Promise<GroupChatMessage> {
    // Validate sender exists
    const sender = await this.childProfileModel.findById(senderId).exec();

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // Check if content is empty
    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    // Check for blocked keywords from safety rules
    const senderSafetyRules = await this.safetyRuleModel.findOne({ childId: senderId }).exec();

    const blockedKeywords = [
      ...(senderSafetyRules?.blockedKeywords || []),
      ...this.inappropriateWords,
    ];

    // Check for inappropriate content
    const { isFlagged, flaggedReason } = this.moderateContent(content, blockedKeywords);

    // Create the message
    const message = new this.groupChatMessageModel({
      senderId,
      content,
      isModerated: true,
      isFlagged,
      flaggedReason,
    });

    await message.save();

    // If content is flagged, create threat incident and alert parent
    if (isFlagged && flaggedReason) {
      await this.createGroupChatThreatIncident(senderId, content, flaggedReason);
    }

    // Populate and return the message with sender info
    const populatedMessage = await this.groupChatMessageModel
      .findById(message._id)
      .populate('senderId', 'fullName age')
      .exec();

    if (!populatedMessage) {
      throw new NotFoundException('Failed to retrieve sent message');
    }

    return populatedMessage;
  }

  /**
   * Get recent group chat messages
   */
  async getGroupMessages(limit: number = 100): Promise<GroupChatMessage[]> {
    return this.groupChatMessageModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('senderId', 'fullName age')
      .exec();
  }

  /**
   * Create threat incident for group chat
   */
  private async createGroupChatThreatIncident(senderId: string, content: string, reason: string): Promise<void> {
    const sender = await this.childProfileModel.findById(senderId).populate('parentId');

    // Create threat incident for sender
    const senderThreat = new this.threatIncidentModel({
      childId: senderId,
      type: 'inappropriate_chat',
      severity: 'medium',
      description: `Inappropriate message sent in group chat: ${content}`,
      metadata: { content, reason, chatType: 'group' },
      status: 'open',
    });
    await senderThreat.save();

    // Alert sender's parent
    if (sender && sender.parentId) {
      const senderAlert = new this.parentAlertModel({
        parentId: sender.parentId,
        childId: senderId,
        type: 'inappropriate_content',
        severity: 'medium',
        title: '⚠️ Inappropriate Group Chat Content',
        message: `${sender.fullName} sent a message with inappropriate content in the group chat.`,
        metadata: { content, reason, chatType: 'group' },
        isRead: false,
      });
      await senderAlert.save();
    }
  }
}
