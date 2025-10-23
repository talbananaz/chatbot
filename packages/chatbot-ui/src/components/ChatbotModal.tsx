import { useMemo } from 'react';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from '@assistant-ui/react';
import { useChatbotContext } from '../context/ChatbotContext';
import { AssistantModal } from './AssistantModal';
import type { ChatbotConfig } from '../types';

/**
 * ChatbotModal component - A modal chatbot interface with runtime provider
 *
 * This component wraps AssistantModal with the necessary runtime configuration.
 * It provides a fixed floating button in the bottom-right corner that opens
 * a modal chat interface when clicked.
 *
 * Usage:
 * ```tsx
 * <ChatbotProvider>
 *   <ChatbotModal config={{ apiUrl: 'http://localhost:3000/api/chat' }} />
 * </ChatbotProvider>
 * ```
 */
interface ChatbotModalProps {
  config: ChatbotConfig;
}

function ChatbotModalContent({ config }: ChatbotModalProps) {
  const { eventBus } = useChatbotContext();

  // Create adapter for custom backend
  const adapter: ChatModelAdapter = useMemo(
    () => ({
      async *run({ messages, abortSignal }: { messages: unknown; abortSignal: AbortSignal }) {
        try {
          const response = await fetch(config.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
            signal: abortSignal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Response body is not readable');
          }

          const decoder = new TextDecoder();
          let buffer = '';
          let accumulatedText = ''; // Accumulate all text chunks

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('0:')) {
                // AI SDK format: 0:"text content"
                const textContent = line.slice(2); // Remove '0:' prefix
                try {
                  // Parse the JSON string (which is a quoted string)
                  const text = JSON.parse(textContent);
                  if (text && typeof text === 'string') {
                    // Accumulate text and yield the full text so far
                    accumulatedText += text;
                    yield { content: [{ type: 'text', text: accumulatedText }] };
                  }
                } catch (e) {
                  console.warn('Failed to parse text chunk:', textContent);
                }
              }
              // Ignore other stream event types for now (tools, finish reasons, etc.)
            }
          }
        } catch (error) {
          console.error('Chatbot error:', error);
          eventBus.publish('chatbot:error', { error });
          throw error;
        }
      },
    }),
    [config.apiUrl, eventBus]
  );

  // Create runtime with custom backend adapter
  const runtime = useLocalRuntime(adapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModal />
    </AssistantRuntimeProvider>
  );
}

export function ChatbotModal({ config }: ChatbotModalProps) {
  return <ChatbotModalContent config={config} />;
}
