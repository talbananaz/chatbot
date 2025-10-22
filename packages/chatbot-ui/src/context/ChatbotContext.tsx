import React, { createContext, useContext, useMemo } from 'react';
import { ToolRegistryImpl } from '../core/ToolRegistry';
import { EventBus } from '../core/EventBus';
import type { ToolRegistry } from '../types';

/**
 * Context for dependency injection of chatbot infrastructure.
 * Follows Dependency Inversion Principle - depends on abstractions (interfaces).
 */
interface ChatbotContextValue {
  toolRegistry: ToolRegistry;
  eventBus: EventBus;
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

interface ChatbotProviderProps {
  children: React.ReactNode;
  toolRegistry?: ToolRegistry;
  eventBus?: EventBus;
}

/**
 * Provider component that supplies infrastructure dependencies.
 * Allows for dependency injection and testing with mock implementations.
 */
export function ChatbotProvider({
  children,
  toolRegistry,
  eventBus,
}: ChatbotProviderProps) {
  const value = useMemo<ChatbotContextValue>(
    () => ({
      toolRegistry: toolRegistry ?? new ToolRegistryImpl(),
      eventBus: eventBus ?? new EventBus(),
    }),
    [toolRegistry, eventBus]
  );

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
}

/**
 * Hook to access chatbot infrastructure.
 */
export function useChatbotContext(): ChatbotContextValue {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbotContext must be used within ChatbotProvider');
  }
  return context;
}
