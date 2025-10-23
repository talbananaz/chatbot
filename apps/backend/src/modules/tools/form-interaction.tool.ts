import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ITool } from './interfaces/tool.interface';

/**
 * Form interaction tool that enables AI to fill forms.
 * Uses an event-driven approach - emits commands that the frontend handles.
 * Follows Open/Closed Principle - extensible without modification.
 */

const formInteractionParamsSchema = z.object({
  action: z.enum(['fill_field', 'submit_form', 'get_form_data']),
  formId: z.string().optional(),
  fieldName: z.string().optional(),
  value: z.unknown().optional(),
});

type FormInteractionParams = z.infer<typeof formInteractionParamsSchema>;

interface FormInteractionResult {
  success: boolean;
  message: string;
  instruction?: {
    action: string;
    formId?: string;
    fieldName?: string;
    value?: unknown;
  };
}

@Injectable()
export class FormInteractionTool implements ITool<FormInteractionParams, FormInteractionResult> {
  readonly name = 'form_interaction';
  readonly description = 'Interacts with forms on the page. Can fill fields, submit forms, or retrieve form data. The frontend application must handle these instructions.';
  readonly parametersSchema = formInteractionParamsSchema;

  async execute(params: FormInteractionParams): Promise<FormInteractionResult> {
    // Validate parameters based on action
    if (params.action === 'fill_field' && (!params.formId || !params.fieldName)) {
      return {
        success: false,
        message: 'fill_field action requires formId and fieldName',
      };
    }

    if (params.action === 'submit_form' && !params.formId) {
      return {
        success: false,
        message: 'submit_form action requires formId',
      };
    }

    // Return instruction for frontend to handle
    // This follows the Command pattern - encapsulates a request as an object
    return {
      success: true,
      message: `Instruction sent to ${params.action}`,
      instruction: {
        action: params.action,
        formId: params.formId,
        fieldName: params.fieldName,
        value: params.value,
      },
    };
  }
}
