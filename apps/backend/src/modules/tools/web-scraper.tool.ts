import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { load } from 'cheerio';
import type { ITool } from './interfaces/tool.interface';

/**
 * Web scraping tool implementation.
 * Follows Single Responsibility Principle - only handles web scraping.
 */

const webScraperParamsSchema = z.object({
  url: z.string().url(),
  selector: z.string().optional(),
});

type WebScraperParams = z.infer<typeof webScraperParamsSchema>;

interface WebScraperResult {
  success: boolean;
  content?: string;
  error?: string;
}

@Injectable()
export class WebScraperTool implements ITool<WebScraperParams, WebScraperResult> {
  readonly name = 'web_scraper';
  readonly description = 'Scrapes content from a web page. Optionally provide a CSS selector to extract specific elements.';
  readonly parametersSchema = webScraperParamsSchema;

  async execute(params: WebScraperParams): Promise<WebScraperResult> {
    try {
      const response = await fetch(params.url);

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error: ${response.status} ${response.statusText}`,
        };
      }

      const html = await response.text();
      const $ = load(html);

      let content: string;
      if (params.selector) {
        content = $(params.selector).text().trim();
      } else {
        // Extract main content, remove scripts and styles
        $('script, style').remove();
        content = $('body').text().trim().replace(/\s+/g, ' ');
      }

      return {
        success: true,
        content,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
