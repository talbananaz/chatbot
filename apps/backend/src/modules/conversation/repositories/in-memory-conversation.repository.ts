import { Injectable } from '@nestjs/common';
import { IConversationRepository } from '../interfaces/conversation-repository.interface.ts';
import { Conversation } from '../entities/conversation.entity.ts';

/**
 * In-memory implementation of conversation repository.
 * Can be easily swapped with database implementation (Strategy pattern).
 * Follows Single Responsibility Principle - only handles data storage.
 */
@Injectable()
export class InMemoryConversationRepository implements IConversationRepository {
  private conversations: Map<string, Conversation> = new Map();

  async findById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) ?? null;
  }

  async save(conversation: Conversation): Promise<void> {
    this.conversations.set(conversation.id, conversation);
  }

  async delete(id: string): Promise<void> {
    this.conversations.delete(id);
  }

  async findAll(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }
}
