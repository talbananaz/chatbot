import { Body, Controller, Post, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AIService } from './ai.service.ts';
import { ChatRequestDto } from './dto/chat-request.dto.ts';

/**
 * Chat controller handling HTTP endpoints.
 * Follows Single Responsibility Principle - only handles HTTP concerns.
 */
@Controller('api')
export class ChatController {
  constructor(private readonly aiService: AIService) {}

  /**
   * POST /api/chat - Stream AI responses
   * Compatible with assistant-ui's expected format
   */
  @Post('chat')
  async chat(@Body() body: ChatRequestDto, @Res() res: Response) {
    try {
      const { messages, conversationId } = body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invalid request: messages array is required',
        });
      }

      const result = await this.aiService.streamChatCompletion(
        messages,
        conversationId,
      );

      // Convert AI SDK stream to assistant-ui compatible format
      const stream = result.toDataStreamResponse();

      // Set appropriate headers for streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Pipe the stream to response
      const reader = stream.body?.getReader();
      if (!reader) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Failed to create stream',
        });
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }

      res.end();
    } catch (error) {
      console.error('Chat error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
