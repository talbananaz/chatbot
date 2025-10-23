import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ITool } from './interfaces/tool.interface';

/**
 * Search tool implementation.
 * Uses DuckDuckGo as a search provider (no API key required).
 * Follows Single Responsibility Principle.
 */

const searchParamsSchema = z.object({
  query: z.string(),
  maxResults: z.number().optional().default(5),
});

type SearchParams = z.infer<typeof searchParamsSchema>;

interface SearchResult {
  success: boolean;
  results?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  error?: string;
}

@Injectable()
export class SearchTool implements ITool<SearchParams, SearchResult> {
  readonly name = 'search';
  readonly description = 'Searches the web using DuckDuckGo and returns relevant results.';
  readonly parametersSchema = searchParamsSchema;

  async execute(params: SearchParams): Promise<SearchResult> {
    try {
      // Using DuckDuckGo's HTML API
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(params.query)}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Search failed: ${response.status}`,
        };
      }

      const html = await response.text();

      // Parse DuckDuckGo results (basic extraction)
      const results = this.parseSearchResults(html, params.maxResults);

      return {
        success: true,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private parseSearchResults(
    html: string,
    maxResults: number,
  ): Array<{ title: string; url: string; snippet: string }> {
    const results: Array<{ title: string; url: string; snippet: string }> = [];

    // Simple regex-based parsing (in production, use a proper HTML parser)
    const resultPattern = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
    const snippetPattern = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/g;

    let match;
    let count = 0;

    while ((match = resultPattern.exec(html)) !== null && count < maxResults) {
      const url = match[1];
      const title = match[2];
      const snippetMatch = snippetPattern.exec(html);
      const snippet = snippetMatch ? snippetMatch[1] : '';

      results.push({
        title: this.decodeHtml(title),
        url: this.decodeHtml(url),
        snippet: this.decodeHtml(snippet),
      });
      count++;
    }

    return results;
  }

  private decodeHtml(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
}
