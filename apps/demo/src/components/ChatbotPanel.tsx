import React, { useRef, useEffect, useMemo } from 'react';
import {
  AssistantModal,
  ChatbotProvider,
  useToolRegistry,
  useEventSubscription,
  type ToolResult,
  type ChatbotConfig,
} from '@chatbot-monorepo/ui';
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from '@assistant-ui/react';
import type { ContactFormHandle } from './ContactForm';
import type { FormInteractionInstruction } from '../types';

/**
 * Chatbot panel that integrates with the contact form.
 * Uses event-driven architecture to decouple from form implementation.
 */

interface ChatbotPanelProps {
  formRef: React.RefObject<ContactFormHandle>;
}

function ChatbotContent({ formRef }: ChatbotPanelProps) {
  // Register form interaction tool handler
  useToolRegistry('form_interaction', async (params: FormInteractionInstruction) => {
    if (!formRef.current) {
      return {
        success: false,
        error: 'Form reference not available',
      };
    }

    try {
      switch (params.action) {
        case 'fill_field':
          if (!params.fieldName) {
            return { success: false, error: 'Field name is required' };
          }
          const filled = formRef.current.fillField(params.fieldName, params.value);
          return {
            success: filled,
            data: filled ? `Field "${params.fieldName}" filled successfully` : undefined,
            error: filled ? undefined : `Field "${params.fieldName}" not found`,
          };

        case 'submit_form':
          formRef.current.submitForm();
          return {
            success: true,
            data: 'Form submitted successfully',
          };

        case 'get_form_data':
          const data = formRef.current.getFormData();
          return {
            success: true,
            data,
          };

        default:
          return {
            success: false,
            error: `Unknown action: ${params.action}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  // Listen for tool events (for logging/debugging)
  useEventSubscription('tool:*', (event) => {
    console.log('Tool executed:', event);
  }, []);

  const config: ChatbotConfig = {
    apiUrl: 'http://localhost:3000/api/chat',
  };

  // Create adapter for custom backend (same as in Chatbot component)
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
          let accumulatedText = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('0:')) {
                const textContent = line.slice(2);
                try {
                  const text = JSON.parse(textContent);
                  if (text && typeof text === 'string') {
                    accumulatedText += text;
                    yield { content: [{ type: 'text', text: accumulatedText }] };
                  }
                } catch (e) {
                  console.warn('Failed to parse text chunk:', textContent);
                }
              }
            }
          }
        } catch (error) {
          console.error('Chatbot error:', error);
          throw error;
        }
      },
    }),
    [config.apiUrl]
  );

  const runtime = useLocalRuntime(adapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModal />
    </AssistantRuntimeProvider>
  );
}

export function ChatbotPanel({ formRef }: ChatbotPanelProps) {
  return (
    <ChatbotProvider>
      <ChatbotContent formRef={formRef} />
    </ChatbotProvider>
  );
}
