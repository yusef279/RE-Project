import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../schemas/user.schema';
import { ChatService } from './chat.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChildProfile } from '../schemas/child-profile.schema';

@Controller('api/chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    @InjectModel(ChildProfile.name)
    private childModel: Model<ChildProfile>,
  ) {}

  /**
   * Send a message
   * Accepts childId in body for parent users
   */
  @Post('send')
  @Roles(UserRole.PARENT) // Only parents can send on behalf of children
  async sendMessage(
    @Body() body: { receiverId: string; content: string; childId?: string },
    @Request() req,
  ) {
    let senderId: string;

    // If childId is provided in body, verify it belongs to the parent
    if (body.childId) {
      const parentId = req.user.profileId;
      const childQueryId = Types.ObjectId.isValid(body.childId) ? new Types.ObjectId(body.childId) : body.childId;
      const parentQueryId = Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId;
      
      const child = await this.childModel.findOne({
        _id: childQueryId,
        parentId: parentQueryId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or access denied');
      }
      senderId = body.childId;
    } else {
      throw new BadRequestException('childId is required in request body');
    }

    return this.chatService.sendMessage(senderId, body.receiverId, body.content);
  }

  /**
   * Get conversation with another child
   * Accepts currentChildId as query parameter for parent users
   */
  @Get('conversation/:childId')
  @Roles(UserRole.PARENT) // Only parents can access on behalf of children
  async getConversation(
    @Param('childId') otherChildId: string,
    @Query('limit') limit: string,
    @Query('currentChildId') currentChildIdParam: string,
    @Request() req,
  ) {
    let currentChildId: string;

    if (currentChildIdParam) {
      // Verify child belongs to parent
      const parentId = req.user.profileId;
      const childQueryId = Types.ObjectId.isValid(currentChildIdParam) ? new Types.ObjectId(currentChildIdParam) : currentChildIdParam;
      const parentQueryId = Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId;
      
      const child = await this.childModel.findOne({
        _id: childQueryId,
        parentId: parentQueryId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or access denied');
      }
      currentChildId = currentChildIdParam;
    } else {
      throw new BadRequestException('currentChildId query parameter is required');
    }

    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getConversation(currentChildId, otherChildId, limitNum);
  }

  /**
   * Get list of chat conversations
   * Accepts childId as query parameter for parent users
   */
  @Get('list')
  @Roles(UserRole.PARENT) // Only parents can access on behalf of children
  async getChatList(
    @Query('childId') childIdParam: string,
    @Request() req,
  ) {
    let childId: string;

    if (childIdParam) {
      // Verify child belongs to parent
      const parentId = req.user.profileId;
      const childQueryId = Types.ObjectId.isValid(childIdParam) ? new Types.ObjectId(childIdParam) : childIdParam;
      const parentQueryId = Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId;
      
      const child = await this.childModel.findOne({
        _id: childQueryId,
        parentId: parentQueryId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or access denied');
      }
      childId = childIdParam;
    } else {
      throw new BadRequestException('childId query parameter is required');
    }

    return this.chatService.getChatList(childId);
  }

  /**
   * Get all available children to chat with
   * Accepts currentChildId as query parameter for parent users
   */
  @Get('available-children')
  @Roles(UserRole.PARENT) // Only parents can access on behalf of children
  async getAvailableChildren(
    @Query('currentChildId') currentChildIdParam: string,
    @Request() req,
  ) {
    let currentChildId: string;

    if (currentChildIdParam) {
      // Verify child belongs to parent
      const parentId = req.user.profileId;
      const childQueryId = Types.ObjectId.isValid(currentChildIdParam) ? new Types.ObjectId(currentChildIdParam) : currentChildIdParam;
      const parentQueryId = Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId;
      
      const child = await this.childModel.findOne({
        _id: childQueryId,
        parentId: parentQueryId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or access denied');
      }
      currentChildId = currentChildIdParam;
    } else {
      throw new BadRequestException('currentChildId query parameter is required');
    }

    return this.chatService.getAvailableChildren(currentChildId);
  }

  /**
   * Mark messages as read
   * Accepts childId in body for parent users
   */
  @Post('mark-read/:senderId')
  @Roles(UserRole.PARENT) // Only parents can access on behalf of children
  async markAsRead(
    @Param('senderId') senderId: string,
    @Body() body: { childId?: string },
    @Request() req,
  ) {
    let receiverId: string;

    if (body.childId) {
      // Verify child belongs to parent
      const parentId = req.user.profileId;
      const childQueryId = Types.ObjectId.isValid(body.childId) ? new Types.ObjectId(body.childId) : body.childId;
      const parentQueryId = Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId;
      
      const child = await this.childModel.findOne({
        _id: childQueryId,
        parentId: parentQueryId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or access denied');
      }
      receiverId = body.childId;
    } else {
      throw new BadRequestException('childId is required in request body');
    }

    await this.chatService.markAsRead(receiverId, senderId);
    return { success: true };
  }

  /**
   * Get unread message count
   * Accepts childId as query parameter for parent users
   */
  @Get('unread-count')
  @Roles(UserRole.PARENT) // Only parents can access on behalf of children
  async getUnreadCount(
    @Query('childId') childIdParam: string,
    @Request() req,
  ) {
    let childId: string;

    if (childIdParam) {
      // Verify child belongs to parent
      const parentId = req.user.profileId;
      const childQueryId = Types.ObjectId.isValid(childIdParam) ? new Types.ObjectId(childIdParam) : childIdParam;
      const parentQueryId = Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId;
      
      const child = await this.childModel.findOne({
        _id: childQueryId,
        parentId: parentQueryId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or access denied');
      }
      childId = childIdParam;
    } else {
      throw new BadRequestException('childId query parameter is required');
    }

    const count = await this.chatService.getUnreadCount(childId);
    return { count };
  }

  /**
   * Send a message to the group chat
   * Accepts childId in body for parent users, or uses childId from user object
   */
  @Post('group/send')
  @Roles(UserRole.PARENT) // Only parents can send on behalf of children
  async sendGroupMessage(
    @Body() body: { content: string; childId?: string },
    @Request() req,
  ) {
    let senderId: string;

    // If childId is provided in body, verify it belongs to the parent
    if (body.childId) {
      const parentId = req.user.profileId;
      const childQueryId = Types.ObjectId.isValid(body.childId) ? new Types.ObjectId(body.childId) : body.childId;
      const parentQueryId = Types.ObjectId.isValid(parentId) ? new Types.ObjectId(parentId) : parentId;
      
      const child = await this.childModel.findOne({
        _id: childQueryId,
        parentId: parentQueryId,
      }).exec();

      if (!child) {
        throw new NotFoundException('Child not found or access denied');
      }
      senderId = body.childId;
    } else {
      // Fallback: try to get from user object (for future child user support)
      senderId = req.user.childId || req.user.sub;
      if (!senderId || senderId === req.user.sub) {
        throw new BadRequestException('childId is required in request body');
      }
    }

    return this.chatService.sendGroupMessage(senderId, body.content);
  }

  /**
   * Get group chat messages
   * Public endpoint - anyone authenticated can view group chat
   */
  @Get('group/messages')
  @Roles(UserRole.PARENT, UserRole.TEACHER, UserRole.ADMIN)
  async getGroupMessages(@Query('limit') limit: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.chatService.getGroupMessages(limitNum);
  }
}
