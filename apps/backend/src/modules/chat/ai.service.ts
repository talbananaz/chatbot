import { Inject, Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(AIService.name);
  private readonly model: ReturnType<typeof bedrock>;

  constructor(
    private readonly configService: ConfigService,
    private readonly conversationService: ConversationService,
    @Inject('TOOLS') private readonly tools: ITool[],
  ) {
    const modelId = this.configService.get<string>('app.bedrock.model');
    const region = this.configService.get<string>('app.bedrock.region');
    const profile = this.configService.get<string>('app.bedrock.profile');
    const accessKeyId = this.configService.get<string>('app.bedrock.accessKeyId');
    const secretAccessKey = this.configService.get<string>('app.bedrock.secretAccessKey');
    const sessionToken = this.configService.get<string>('app.bedrock.sessionToken');

    this.logger.log(JSON.stringify({
      action: 'initializing_bedrock',
      modelId,
      region,
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
      hasSessionToken: !!sessionToken,
      hasProfile: !!profile,
    }));

    // Configure AWS Bedrock using values from ConfigService
    // Supports three authentication modes:
    // 1. AWS SSO Profile: profile is set
    // 2. Static Credentials: accessKeyId and secretAccessKey are set
    // 3. Default Credentials: Uses AWS SDK default credential chain (neither above are set)
    try {
      this.model = bedrock(modelId!, {
        region,
        profile,
        ...(accessKeyId && secretAccessKey ? { 
          accessKeyId, 
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {})
        } : {}),
      });
      this.logger.log('Bedrock model initialized successfully');
    } catch (error) {
      this.logger.error(JSON.stringify({
        action: 'bedrock_init_failed',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
      }));
      throw error;
    }
  }

  /**
   * Test Bedrock connection with a simple request
   */
  async testConnection() {
    this.logger.log('Testing Bedrock connection...');
    
    try {
      const result = streamText({
        model: this.model,
        messages: [{ role: 'user', content: 'Say "test" and nothing else.' }],
        maxTokens: 10,
      });

      // Get the text from the result
      const { text, finishReason, usage, error: streamError } = await result;
      
      if (streamError) {
        this.logger.error(JSON.stringify({
          action: 'stream_had_error',
          error: streamError,
        }));
        throw streamError;
      }
      
      this.logger.log(JSON.stringify({
        action: 'bedrock_test_successful',
        text,
        finishReason,
        usage,
      }));
      
      return { success: true, text, finishReason, usage };
    } catch (error) {
      this.logger.error(JSON.stringify({
        action: 'bedrock_test_failed',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: (error as any).cause,
        } : String(error),
      }));
      throw error;
    }
  }

  /**
   * Stream AI response with tool support.
   * Follows the Template Method pattern - defines algorithm skeleton.
   */
  async streamChatCompletion(
    messages: CoreMessage[],
    conversationId?: string,
  ) {
    const streamId = `stream_${Date.now()}`;
    
    this.logger.log(JSON.stringify({
      streamId,
      action: 'stream_request_started',
      messageCount: messages.length,
      conversationId,
    }));

    try {
      // Load conversation history if ID provided
      let allMessages = messages;
      if (conversationId) {
        const history = await this.conversationService.getConversationHistory(conversationId);
        const historicalMessages: CoreMessage[] = history.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
        allMessages = [...historicalMessages, ...messages];
        this.logger.debug(JSON.stringify({
          streamId,
          action: 'loaded_conversation_history',
          historySize: history.length,
          totalMessages: allMessages.length,
        }));
      }

      // Convert tools to AI SDK format
      const toolDefinitions = this.tools.reduce((acc, tool) => {
        acc[tool.name] = {
          description: tool.description,
          parameters: tool.parametersSchema,
          execute: async (params: unknown) => {
            this.logger.debug(JSON.stringify({
              streamId,
              action: 'tool_executed',
              toolName: tool.name,
            }));
            const result = await tool.execute(params);
            return result;
          },
        };
        return acc;
      }, {} as Record<string, unknown>);

      this.logger.debug(JSON.stringify({
        streamId,
        action: 'calling_bedrock_streamtext',
        toolCount: this.tools.length,
        messageCount: allMessages.length,
      }));

      // Stream response with tools
      const result = streamText({
        model: this.model,
        messages: convertToCoreMessages(allMessages),
        tools: toolDefinitions,
        maxSteps: 5, // Allow multi-step tool usage
      });

      this.logger.log(JSON.stringify({
        streamId,
        action: 'streamtext_created',
      }));

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
    } catch (error) {
      this.logger.error(JSON.stringify({
        streamId,
        action: 'stream_error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
      }));
      throw error;
    }
  }
}
