import { Body, Controller, Post, Get, Res, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { AIService } from './ai.service.ts';
import { ChatRequestDto } from './dto/chat-request.dto.ts';

/**
 * Chat controller handling HTTP endpoints.
 * Follows Single Responsibility Principle - only handles HTTP concerns.
 */
@Controller('api')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly aiService: AIService) {}

  /**
   * GET /api/health - Test Bedrock connection
   */
  @Get('health')
  async health() {
    try {
      const result = await this.aiService.testConnection();
      return {
        status: 'ok',
        bedrock: 'connected',
        test: result,
      };
    } catch (error) {
      this.logger.error(JSON.stringify({
        action: 'health_check_failed',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
      }));
      return {
        status: 'error',
        bedrock: 'failed',
        error: error instanceof Error ? error.message : String(error),
        details: error,
      };
    }
  }

  /**
   * POST /api/chat - Stream AI responses
   * Compatible with assistant-ui's expected format
   */
  @Post('chat')
  async chat(@Body() body: ChatRequestDto, @Res() res: Response) {
    const requestId = `req_${Date.now()}`;
    this.logger.log(JSON.stringify({
      requestId,
      action: 'chat_request_received',
      messageCount: body.messages?.length,
      conversationId: body.conversationId,
    }));

    try {
      const { messages, conversationId } = body;

      if (!messages || !Array.isArray(messages)) {
        this.logger.warn(JSON.stringify({
          requestId,
          action: 'validation_failed',
          error: 'messages array is required',
        }));
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid request: messages array is required',
        });
      }

      this.logger.debug(JSON.stringify({
        requestId,
        action: 'calling_ai_service',
        messages: messages.map(m => ({ role: m.role, contentLength: JSON.stringify(m.content).length })),
      }));

      const result = await this.aiService.streamChatCompletion(
        messages,
        conversationId,
      );

      this.logger.debug(JSON.stringify({
        requestId,
        action: 'ai_service_responded',
      }));

      // Convert AI SDK stream to assistant-ui compatible format
      const stream = result.toDataStreamResponse();

      // Set appropriate headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Pipe the stream to response
      const reader = stream.body?.getReader();
      if (!reader) {
        this.logger.error(JSON.stringify({
          requestId,
          action: 'stream_creation_failed',
          error: 'Failed to create stream reader',
        }));
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Failed to create stream',
        });
      }

      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
        chunkCount++;
      }

      res.end();
      
      this.logger.log(JSON.stringify({
        requestId,
        action: 'chat_completed',
        chunksStreamed: chunkCount,
      }));
    } catch (error) {
      this.logger.error(JSON.stringify({
        requestId,
        action: 'chat_error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : String(error),
      }));
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
