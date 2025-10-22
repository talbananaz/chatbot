import { useEffect } from 'react';
import { useChatbotContext } from '../context/ChatbotContext';
import type { ToolHandler } from '../types';

/**
 * Hook to register tool handlers.
 * Automatically unregisters on unmount following the RAII pattern.
 */
export function useToolRegistry<TParams = unknown, TResult = unknown>(
  toolName: string,
  handler: ToolHandler<TParams, TResult>
) {
  const { toolRegistry } = useChatbotContext();

  useEffect(() => {
    toolRegistry.register(toolName, handler);

    return () => {
      toolRegistry.unregister(toolName);
    };
  }, [toolRegistry, toolName, handler]);
}
