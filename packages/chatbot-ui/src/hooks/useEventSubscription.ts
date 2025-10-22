import { useEffect } from 'react';
import { useChatbotContext } from '../context/ChatbotContext';

/**
 * Hook to subscribe to chatbot events.
 * Automatically unsubscribes on unmount.
 */
export function useEventSubscription<T = unknown>(
  eventType: string,
  listener: (event: T) => void,
  deps: React.DependencyList = []
) {
  const { eventBus } = useChatbotContext();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe(eventType, listener);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventBus, eventType, ...deps]);
}
