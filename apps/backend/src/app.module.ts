import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.ts';
import { ChatModule } from './modules/chat/chat.module.ts';
import { ConversationModule } from './modules/conversation/conversation.module.ts';
import { ToolsModule } from './modules/tools/tools.module.ts';

/**
 * Application root module.
 * Follows modular architecture with feature-based modules.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ChatModule,
    ConversationModule,
    ToolsModule,
  ],
})
export class AppModule {}
