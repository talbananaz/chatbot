import type { ToolHandler, ToolRegistry, ToolResult } from '../types';

/**
 * Implementation of the Registry pattern for managing tool handlers.
 * Follows Open/Closed Principle - open for extension via registration, closed for modification.
 */
export class ToolRegistryImpl implements ToolRegistry {
  private handlers: Map<string, ToolHandler> = new Map();

  /**
   * Register a tool handler following the Strategy pattern.
   * Allows runtime configuration of tool behavior without modifying the core library.
   */
  register<TParams = unknown, TResult = unknown>(
    toolName: string,
    handler: ToolHandler<TParams, TResult>
  ): void {
    if (this.handlers.has(toolName)) {
      console.warn(`Tool handler for "${toolName}" is being overwritten`);
    }
    this.handlers.set(toolName, handler as ToolHandler);
  }

  /**
   * Remove a registered tool handler.
   */
  unregister(toolName: string): void {
    this.handlers.delete(toolName);
  }

  /**
   * Execute a tool handler by name.
   * Returns a structured result following the Result pattern for error handling.
   */
  async execute<TParams = unknown, TResult = unknown>(
    toolName: string,
    params: TParams
  ): Promise<ToolResult<TResult>> {
    const handler = this.handlers.get(toolName);

    if (!handler) {
      return {
        success: false,
        error: `No handler registered for tool: ${toolName}`,
      } as ToolResult<TResult>;
    }

    try {
      return (await handler(params)) as ToolResult<TResult>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      } as ToolResult<TResult>;
    }
  }

  /**
   * Check if a handler is registered for a specific tool.
   */
  hasHandler(toolName: string): boolean {
    return this.handlers.has(toolName);
  }
}
