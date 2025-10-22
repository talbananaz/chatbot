import React, { useRef } from 'react';
import { ContactForm, type ContactFormHandle } from './components/ContactForm';
import { ChatbotPanel } from './components/ChatbotPanel';
import type { FormData } from './types';
import './styles.css';

/**
 * Main application component.
 * Demonstrates loose coupling - form and chatbot communicate via refs and events.
 */
function App() {
  const formRef = useRef<ContactFormHandle>(null);

  const handleFormSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    alert(`Form submitted!\n\nName: ${data.name}\nEmail: ${data.email}\nSubject: ${data.subject}`);
  };

  return (
    <div className="app-container">
      <main className="main-content">
        <ContactForm ref={formRef} onSubmit={handleFormSubmit} />
      </main>
      <ChatbotPanel formRef={formRef} />
    </div>
  );
}

export default App;
