import { useMemo } from 'react';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from '@assistant-ui/react';
import { Thread } from '@assistant-ui/react-ui';
import { useChatbotContext } from '../context/ChatbotContext';
import type { ChatbotConfig } from '../types';

/**
 * Main chatbot component following the Facade pattern.
 * Provides a simple interface wrapping complex assistant-ui functionality.
 */
interface ChatbotProps {
  config: ChatbotConfig;
  className?: string;
}

function ChatbotContent({ className }: Pick<ChatbotProps, 'className'>) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Thread />
    </div>
  );
}

export function Chatbot({ config, className }: ChatbotProps) {
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

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('0:')) {
                const json = line.slice(2);
                const data = JSON.parse(json);
                if (data.type === 'text-delta' && data.textDelta) {
                  yield { content: [{ type: 'text', text: data.textDelta }] };
                }
              }
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
      <ChatbotContent className={className} />
    </AssistantRuntimeProvider>
  );
}
