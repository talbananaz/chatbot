import { Inject, Injectable } from '@nestjs/common';
import {
  IConversationRepository,
} from '../../domain/repositories/conversation.repository.interface';
import { Conversation, Message } from '../../domain/entities/conversation.entity';
import { randomUUID } from 'crypto';

/**
 * Application service for conversation management.
 * Follows Single Responsibility Principle - orchestrates business logic.
 * Depends on abstractions (IConversationRepository) not concretions.
 */
@Injectable()
export class ConversationService {
  constructor(
    @Inject(IConversationRepository)
    private readonly conversationRepository: IConversationRepository,
  ) {}

  async getOrCreateConversation(id?: string): Promise<Conversation> {
    if (id) {
      const existing = await this.conversationRepository.findById(id);
      if (existing) {
        return existing;
      }
    }

    const newId = id || randomUUID();
    const conversation = new Conversation(newId, [], new Date(), new Date());
    await this.conversationRepository.save(conversation);
    return conversation;
  }

  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
  ): Promise<Conversation> {
    const conversation = await this.getOrCreateConversation(conversationId);
    const message = new Message(randomUUID(), role, content, new Date());
    const updated = conversation.addMessage(message);
    await this.conversationRepository.save(updated);
    return updated;
  }

  async getConversationHistory(conversationId: string): Promise<Message[]> {
    const conversation = await this.conversationRepository.findById(conversationId);
    return conversation?.messages ?? [];
  }
}
