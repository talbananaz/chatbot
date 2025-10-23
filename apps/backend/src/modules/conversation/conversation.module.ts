import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service.ts';
import { IConversationRepository } from './interfaces/conversation-repository.interface.ts';
import { InMemoryConversationRepository } from './repositories/in-memory-conversation.repository.ts';

/**
 * Conversation module that handles conversation management.
 * Encapsulates conversation-related services and repositories.
 */
@Module({
  providers: [
    ConversationService,
    {
      provide: IConversationRepository,
      useClass: InMemoryConversationRepository,
    },
  ],
  exports: [ConversationService],
})
export class ConversationModule {}
