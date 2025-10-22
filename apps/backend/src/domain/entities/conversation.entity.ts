/**
 * Domain entity representing a conversation.
 * Follows the Entity pattern from Domain-Driven Design.
 */
export class Conversation {
  constructor(
    public readonly id: string,
    public readonly messages: Message[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  addMessage(message: Message): Conversation {
    return new Conversation(
      this.id,
      [...this.messages, message],
      this.createdAt,
      new Date(),
    );
  }
}

/**
 * Value object representing a message.
 */
export class Message {
  constructor(
    public readonly id: string,
    public readonly role: 'user' | 'assistant' | 'system',
    public readonly content: string,
    public readonly timestamp: Date,
    public readonly toolCalls?: ToolCall[],
    public readonly toolResults?: ToolResult[],
  ) {}
}

/**
 * Value object for tool calls.
 */
export class ToolCall {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly parameters: Record<string, unknown>,
  ) {}
}

/**
 * Value object for tool results.
 */
export class ToolResult {
  constructor(
    public readonly toolCallId: string,
    public readonly result: unknown,
  ) {}
}
