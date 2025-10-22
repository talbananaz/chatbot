import type { ToolEvent } from '../types';

type EventListener<T = unknown> = (event: T) => void;

/**
 * Implementation of the Observer pattern for event-driven architecture.
 * Decouples the chatbot library from specific implementations.
 */
export class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();

  /**
   * Subscribe to an event type.
   * Returns an unsubscribe function following the Subscription pattern.
   */
  subscribe<T = unknown>(eventType: string, listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listeners = this.listeners.get(eventType)!;
    listeners.add(listener as EventListener);

    // Return unsubscribe function
    return () => {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Publish an event to all subscribers.
   */
  publish<T = unknown>(eventType: string, event: T): void {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return;

    listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for "${eventType}":`, error);
      }
    });
  }

  /**
   * Publish a tool execution event.
   */
  publishToolEvent<T = unknown>(toolName: string, parameters: T): void {
    const event: ToolEvent<T> = {
      toolName,
      parameters,
      timestamp: Date.now(),
    };
    this.publish(`tool:${toolName}`, event);
    this.publish('tool:*', event);
  }

  /**
   * Remove all listeners for an event type.
   */
  clear(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }
}
