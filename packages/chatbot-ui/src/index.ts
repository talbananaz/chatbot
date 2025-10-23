/**
 * Chatbot UI Library
 *
 * A SOLID-principle-based wrapper around @assistant-ui/react that provides
 * an event-driven architecture for extensibility.
 *
 * Key Design Patterns:
 * - Facade Pattern: Chatbot component provides simple interface
 * - Strategy Pattern: Tool handlers can be swapped at runtime
 * - Observer Pattern: Event-driven communication
 * - Registry Pattern: Dynamic tool registration
 * - Dependency Injection: Via React Context
 */

// Core components
export { Chatbot } from './components/Chatbot';
export { ChatbotModal } from './components/ChatbotModal';
export { AssistantModal } from './components/AssistantModal';
export { TooltipIconButton } from './components/TooltipIconButton';
export { ChatbotProvider, useChatbotContext } from './context/ChatbotContext';

// Core infrastructure
export { ToolRegistryImpl } from './core/ToolRegistry';
export { EventBus } from './core/EventBus';

// Hooks
export { useToolRegistry } from './hooks/useToolRegistry';
export { useEventSubscription } from './hooks/useEventSubscription';

// Types
export type {
  ChatbotConfig,
  ToolEvent,
  ToolResult,
  ToolHandler,
  ToolRegistry,
} from './types';
