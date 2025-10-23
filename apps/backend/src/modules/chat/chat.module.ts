import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller.ts';
import { AIService } from './ai.service.ts';
import { ConversationModule } from '../conversation/conversation.module.ts';
import { ToolsModule } from '../tools/tools.module.ts';

/**
 * Chat module that handles AI chat functionality.
 * Encapsulates chat-related controllers and services.
 */
@Module({
  imports: [ConversationModule, ToolsModule],
  controllers: [ChatController],
  providers: [AIService],
  exports: [AIService],
})
export class ChatModule {}
