/**
 * Types for the demo application.
 */

export interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface FormInteractionInstruction {
  action: 'fill_field' | 'submit_form' | 'get_form_data';
  formId?: string;
  fieldName?: string;
  value?: unknown;
}
