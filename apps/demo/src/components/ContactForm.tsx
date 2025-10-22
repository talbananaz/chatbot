import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import type { FormData } from '../types';

/**
 * Contact form component with imperative API for external control.
 * Follows the Command pattern - exposes methods for form manipulation.
 */

export interface ContactFormHandle {
  fillField(fieldName: string, value: unknown): boolean;
  submitForm(): void;
  getFormData(): FormData;
  resetForm(): void;
}

interface ContactFormProps {
  onSubmit?: (data: FormData) => void;
}

export const ContactForm = forwardRef<ContactFormHandle, ContactFormProps>(
  ({ onSubmit }, ref) => {
    const [formData, setFormData] = useState<FormData>({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      priority: 'medium',
    });

    const [status, setStatus] = useState<{
      type: 'success' | 'error' | 'info' | null;
      message: string;
    }>({ type: null, message: '' });

    /**
     * Fill a specific form field.
     * Returns true if field was found and updated.
     */
    const fillField = useCallback((fieldName: string, value: unknown): boolean => {
      if (!(fieldName in formData)) {
        setStatus({
          type: 'error',
          message: `Field "${fieldName}" does not exist`,
        });
        return false;
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: value,
      }));

      setStatus({
        type: 'info',
        message: `Field "${fieldName}" updated by AI`,
      });

      return true;
    }, [formData]);

    /**
     * Submit the form programmatically.
     */
    const submitForm = useCallback(() => {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.message) {
        setStatus({
          type: 'error',
          message: 'Please fill in all required fields',
        });
        return;
      }

      setStatus({
        type: 'success',
        message: 'Form submitted successfully!',
      });

      onSubmit?.(formData);
    }, [formData, onSubmit]);

    /**
     * Get current form data.
     */
    const getFormData = useCallback(() => formData, [formData]);

    /**
     * Reset form to initial state.
     */
    const resetForm = useCallback(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        priority: 'medium',
      });
      setStatus({ type: null, message: '' });
    }, []);

    // Expose methods via ref (Imperative Handle pattern)
    useImperativeHandle(ref, () => ({
      fillField,
      submitForm,
      getFormData,
      resetForm,
    }), [fillField, submitForm, getFormData, resetForm]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      submitForm();
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
      <div className="form-container">
        <h1>Contact Form</h1>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Try asking the AI assistant to fill this form for you!
        </p>

        <form id="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          {status.type && (
            <div className={`status-message status-${status.type}`}>
              {status.message}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    );
  }
);

ContactForm.displayName = 'ContactForm';
