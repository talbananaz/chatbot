import { Module } from '@nestjs/common';
import { WebScraperTool } from './web-scraper.tool.ts';
import { SearchTool } from './search.tool.ts';
import { FormInteractionTool } from './form-interaction.tool.ts';

/**
 * Tools module that provides AI tools.
 * Encapsulates all tool implementations.
 */
@Module({
  providers: [
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
  exports: ['TOOLS'],
})
export class ToolsModule {}
