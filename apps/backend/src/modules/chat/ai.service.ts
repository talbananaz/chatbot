import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { streamText, convertToCoreMessages, type CoreMessage } from 'ai';
import { ConversationService } from '../conversation/conversation.service.ts';
import type { ITool } from '../tools/interfaces/tool.interface';

/**
 * AI Service that integrates with AWS Bedrock.
 * Follows Single Responsibility Principle - handles AI interactions.
 * Uses Dependency Injection for tools and services.
 */
@Injectable()
export class AIService {
  private readonly model: ReturnType<typeof bedrock>;

  constructor(
    private readonly configService: ConfigService,
    private readonly conversationService: ConversationService,
    @Inject('TOOLS') private readonly tools: ITool[],
  ) {
    const modelId = this.configService.get<string>('app.bedrock.model');

    // The bedrock() function uses environment variables and AWS credential chain
    // Set these environment variables before starting the app:
    // - AWS_REGION: AWS region
    // - AWS_PROFILE: AWS SSO profile name (if using SSO)
    // - AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY: Static credentials (if not using SSO)
    // If none are set, it will use the default AWS credential chain
    this.model = bedrock(modelId!);
  }

  /**
   * Stream AI response with tool support.
   * Follows the Template Method pattern - defines algorithm skeleton.
   */
  async streamChatCompletion(
    messages: CoreMessage[],
    conversationId?: string,
  ) {
    // Load conversation history if ID provided
    let allMessages = messages;
    if (conversationId) {
      const history = await this.conversationService.getConversationHistory(conversationId);
      const historicalMessages: CoreMessage[] = history.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      allMessages = [...historicalMessages, ...messages];
    }

    // Convert tools to AI SDK format
    const toolDefinitions = this.tools.reduce((acc, tool) => {
      acc[tool.name] = {
        description: tool.description,
        parameters: tool.parametersSchema,
        execute: async (params: unknown) => {
          const result = await tool.execute(params);
          return result;
        },
      };
      return acc;
    }, {} as Record<string, unknown>);

    // Stream response with tools
    const result = streamText({
      model: this.model,
      messages: convertToCoreMessages(allMessages),
      tools: toolDefinitions,
      maxSteps: 5, // Allow multi-step tool usage
    });

    // Save messages to history if conversation ID provided
    if (conversationId) {
      // Save user message
      const userMessage = messages.find(m => m.role === 'user');
      if (userMessage && typeof userMessage.content === 'string') {
        await this.conversationService.addMessage(
          conversationId,
          'user',
          userMessage.content,
        );
      }

      // Note: Assistant message will be saved after streaming completes
      // This could be improved with a callback mechanism
    }

    return result;
  }
}
