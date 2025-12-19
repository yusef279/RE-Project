import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('api/chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Send a message
   */
  @Post('send')
  async sendMessage(
    @Body() body: { receiverId: string; content: string },
    @Request() req,
  ) {
    const senderId = req.user.childId || req.user.sub;
    return this.chatService.sendMessage(senderId, body.receiverId, body.content);
  }

  /**
   * Get conversation with another child
   */
  @Get('conversation/:childId')
  async getConversation(
    @Param('childId') otherChildId: string,
    @Query('limit') limit: string,
    @Request() req,
  ) {
    const currentChildId = req.user.childId || req.user.sub;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getConversation(currentChildId, otherChildId, limitNum);
  }

  /**
   * Get list of chat conversations
   */
  @Get('list')
  async getChatList(@Request() req) {
    const childId = req.user.childId || req.user.sub;
    return this.chatService.getChatList(childId);
  }

  /**
   * Get all available children to chat with
   */
  @Get('available-children')
  async getAvailableChildren(@Request() req) {
    const currentChildId = req.user.childId || req.user.sub;
    return this.chatService.getAvailableChildren(currentChildId);
  }

  /**
   * Mark messages as read
   */
  @Post('mark-read/:senderId')
  async markAsRead(@Param('senderId') senderId: string, @Request() req) {
    const receiverId = req.user.childId || req.user.sub;
    await this.chatService.markAsRead(receiverId, senderId);
    return { success: true };
  }

  /**
   * Get unread message count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const childId = req.user.childId || req.user.sub;
    const count = await this.chatService.getUnreadCount(childId);
    return { count };
  }

  /**
   * Send a message to the group chat
   */
  @Post('group/send')
  async sendGroupMessage(
    @Body() body: { content: string },
    @Request() req,
  ) {
    const senderId = req.user.childId || req.user.sub;
    return this.chatService.sendGroupMessage(senderId, body.content);
  }

  /**
   * Get group chat messages
   */
  @Get('group/messages')
  async getGroupMessages(@Query('limit') limit: string) {
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.chatService.getGroupMessages(limitNum);
  }
}
