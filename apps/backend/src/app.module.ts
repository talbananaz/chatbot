import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import bedrockConfig from './config/bedrock.config';
import { ChatController } from './presentation/controllers/chat.controller';
import { AIService } from './application/services/ai.service';
import { ConversationService } from './application/services/conversation.service';
import { InMemoryConversationRepository } from './infrastructure/repositories/in-memory-conversation.repository';
import { IConversationRepository } from './domain/repositories/conversation.repository.interface';
import { WebScraperTool } from './application/tools/web-scraper.tool';
import { SearchTool } from './application/tools/search.tool';
import { FormInteractionTool } from './application/tools/form-interaction.tool';

/**
 * Application root module.
 * Follows Dependency Injection pattern via NestJS.
 * Demonstrates modular, testable architecture.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [bedrockConfig],
      isGlobal: true,
    }),
  ],
  controllers: [ChatController],
  providers: [
    AIService,
    ConversationService,
    {
      provide: IConversationRepository,
      useClass: InMemoryConversationRepository,
    },
    WebScraperTool,
    SearchTool,
    FormInteractionTool,
    {
      provide: 'TOOLS',
      useFactory: (
        webScraper: WebScraperTool,
        search: SearchTool,
        formInteraction: FormInteractionTool,
      ) => [webScraper, search, formInteraction],
      inject: [WebScraperTool, SearchTool, FormInteractionTool],
    },
  ],
})
export class AppModule {}
