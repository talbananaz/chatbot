import { Conversation } from '../entities/conversation.entity';

/**
 * Repository interface following the Repository pattern.
 * Abstracts data persistence, adhering to Dependency Inversion Principle.
 */
export interface IConversationRepository {
  findById(id: string): Promise<Conversation | null>;
  save(conversation: Conversation): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Conversation[]>;
}

export const IConversationRepository = Symbol('IConversationRepository');
