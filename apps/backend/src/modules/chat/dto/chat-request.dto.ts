import { type CoreMessage } from 'ai';

/**
 * Data Transfer Object for chat requests.
 */
export class ChatRequestDto {
  messages: CoreMessage[];
  conversationId?: string;
}
