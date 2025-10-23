import React, { useRef, useEffect } from 'react';
import {
  Chatbot,
  ChatbotProvider,
  useToolRegistry,
  useEventSubscription,
  type ToolResult,
  type ChatbotConfig,
} from '@chatbot-monorepo/ui';
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

  return (
    <div className="chatbot-panel">
      <Chatbot config={config} className="chatbot-panel" />
    </div>
  );
}

export function ChatbotPanel({ formRef }: ChatbotPanelProps) {
  return (
    <ChatbotProvider>
      <ChatbotContent formRef={formRef} />
    </ChatbotProvider>
  );
}
