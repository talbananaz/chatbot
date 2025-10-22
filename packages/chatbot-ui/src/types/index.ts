export interface ChatbotConfig {
  apiUrl: string;
  threadId?: string;
  onThreadChange?: (threadId: string) => void;
}

export interface ToolEvent<T = unknown> {
  toolName: string;
  parameters: T;
  timestamp: number;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type ToolHandler<TParams = unknown, TResult = unknown> = (
  params: TParams
) => Promise<ToolResult<TResult>>;

export interface ToolRegistry {
  register<TParams = unknown, TResult = unknown>(
    toolName: string,
    handler: ToolHandler<TParams, TResult>
  ): void;
  unregister(toolName: string): void;
  execute<TParams = unknown, TResult = unknown>(
    toolName: string,
    params: TParams
  ): Promise<ToolResult<TResult>>;
  hasHandler(toolName: string): boolean;
}
