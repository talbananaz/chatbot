# System Architecture Documentation

## Overview

This project is a comprehensive AI chatbot system built with modern web technologies, following SOLID principles and design patterns. It consists of three main components:

1. **Chatbot UI Library** (`packages/chatbot-ui`)
2. **NestJS Backend** (`apps/backend`)
3. **React Demo Application** (`apps/demo`)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Demo Application                     │
│  ┌───────────────────┐         ┌───────────────────┐   │
│  │  ContactForm      │◄───────►│  ChatbotPanel     │   │
│  │  (Imperative API) │  Ref    │  (Event-Driven)   │   │
│  └───────────────────┘         └───────────────────┘   │
│                                          │              │
│                                          │ uses         │
│                                          ▼              │
│                               ┌─────────────────────┐   │
│                               │  Chatbot Library    │   │
│                               │  (Event Bus +       │   │
│                               │   Tool Registry)    │   │
│                               └─────────────────────┘   │
└──────────────────────────────────┬──────────────────────┘
                                   │ HTTP/Streaming
                                   ▼
                    ┌──────────────────────────────┐
                    │      NestJS Backend          │
                    │  ┌────────────────────────┐  │
                    │  │  ChatController        │  │
                    │  │  (Presentation Layer)  │  │
                    │  └────────────────────────┘  │
                    │            │                 │
                    │            ▼                 │
                    │  ┌────────────────────────┐  │
                    │  │  AIService             │  │
                    │  │  ConversationService   │  │
                    │  │  (Application Layer)   │  │
                    │  └────────────────────────┘  │
                    │            │                 │
                    │            ▼                 │
                    │  ┌────────────────────────┐  │
                    │  │  Repository            │  │
                    │  │  (Infrastructure)      │  │
                    │  └────────────────────────┘  │
                    │            │                 │
                    │            ▼                 │
                    │  ┌────────────────────────┐  │
                    │  │  Domain Entities       │  │
                    │  │  (Domain Layer)        │  │
                    │  └────────────────────────┘  │
                    └──────────────────────────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  AWS Bedrock    │
                          │  (Claude 3.5)   │
                          └─────────────────┘
```

## Component Details

### 1. Chatbot UI Library

**Purpose**: Reusable React component library that wraps @assistant-ui/react with an event-driven architecture.

**Key Features**:
- Event-driven tool execution
- Dynamic tool registration
- Decoupled from application specifics
- Fully typed with TypeScript

**Design Patterns**:

#### Facade Pattern
The `Chatbot` component provides a simple interface:
```typescript
<Chatbot config={{ apiUrl: 'http://localhost:3000/api/chat' }} />
```

#### Observer Pattern (Event Bus)
Components can subscribe to and publish events:
```typescript
eventBus.subscribe('tool:*', (event) => {
  console.log('Tool executed:', event);
});
```

#### Registry Pattern (Tool Registry)
Dynamic tool registration at runtime:
```typescript
toolRegistry.register('my_tool', async (params) => {
  // Handle tool execution
  return { success: true, data: result };
});
```

#### Strategy Pattern
Tool handlers can be swapped without modifying core code:
```typescript
interface ToolHandler<TParams, TResult> {
  (params: TParams): Promise<ToolResult<TResult>>;
}
```

**File Structure**:
```
packages/chatbot-ui/
├── src/
│   ├── components/
│   │   └── Chatbot.tsx          # Main facade component
│   ├── context/
│   │   └── ChatbotContext.tsx   # Dependency injection
│   ├── core/
│   │   ├── EventBus.ts          # Observer pattern
│   │   └── ToolRegistry.ts      # Registry pattern
│   ├── hooks/
│   │   ├── useToolRegistry.ts
│   │   └── useEventSubscription.ts
│   └── types/
│       └── index.ts             # TypeScript interfaces
```

### 2. NestJS Backend

**Purpose**: Scalable backend with AWS Bedrock integration, following Clean Architecture principles.

**Architecture Layers**:

#### Domain Layer
Pure business entities and interfaces:
```typescript
class Conversation {
  constructor(
    public readonly id: string,
    public readonly messages: Message[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
```

#### Application Layer
Business logic and use cases:
- `AIService`: Manages AI interactions with Bedrock
- `ConversationService`: Handles conversation history

#### Infrastructure Layer
External concerns (data access, external APIs):
- `InMemoryConversationRepository`: Data persistence
- Can be swapped with database implementation

#### Presentation Layer
HTTP endpoints and API contracts:
- `ChatController`: Handles streaming chat requests

**SOLID Principles Implementation**:

1. **Single Responsibility**: Each class has one reason to change
   - `WebScraperTool` only handles web scraping
   - `SearchTool` only handles search
   - `FormInteractionTool` only handles form commands

2. **Open/Closed**: Open for extension, closed for modification
   - New tools can be added without changing `AIService`
   - Tools implement `ITool` interface

3. **Liskov Substitution**: Subtypes can replace base types
   - Any `IConversationRepository` implementation works
   - Any `ITool` implementation works

4. **Interface Segregation**: Small, focused interfaces
   - `ITool<TParams, TResult>` is minimal
   - `IConversationRepository` has only necessary methods

5. **Dependency Inversion**: Depend on abstractions
   - Services depend on `IConversationRepository`, not concrete class
   - `AIService` depends on `ITool[]`, not specific tools

**Tools Architecture**:

All tools implement the `ITool` interface:
```typescript
interface ITool<TParams, TResult> {
  readonly name: string;
  readonly description: string;
  readonly parametersSchema: z.ZodSchema<TParams>;
  execute(params: TParams): Promise<TResult>;
}
```

1. **WebScraperTool**: Extracts content from web pages
   - Uses Cheerio for HTML parsing
   - Optional CSS selectors
   - Error handling with result pattern

2. **SearchTool**: Web search via DuckDuckGo
   - No API key required
   - Parses HTML results
   - Returns structured search results

3. **FormInteractionTool**: Event-driven form manipulation
   - Returns instructions for frontend
   - Follows Command pattern
   - Decoupled from specific forms

**File Structure**:
```
apps/backend/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── conversation.entity.ts
│   │   ├── repositories/
│   │   │   └── conversation.repository.interface.ts
│   │   └── tools/
│   │       └── tool.interface.ts
│   ├── application/
│   │   ├── services/
│   │   │   ├── ai.service.ts
│   │   │   └── conversation.service.ts
│   │   └── tools/
│   │       ├── web-scraper.tool.ts
│   │       ├── search.tool.ts
│   │       └── form-interaction.tool.ts
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── in-memory-conversation.repository.ts
│   ├── presentation/
│   │   └── controllers/
│   │       └── chat.controller.ts
│   ├── config/
│   │   └── bedrock.config.ts
│   ├── app.module.ts
│   └── main.ts
```

### 3. Demo Application

**Purpose**: Showcase chatbot integration with loose coupling.

**Key Components**:

#### ContactForm
Uses `forwardRef` and `useImperativeHandle` to expose methods:
```typescript
interface ContactFormHandle {
  fillField(fieldName: string, value: unknown): boolean;
  submitForm(): void;
  getFormData(): FormData;
  resetForm(): void;
}
```

#### ChatbotPanel
Registers tool handlers using the library's hook:
```typescript
useToolRegistry('form_interaction', async (params) => {
  // Handle form interaction via ref
  formRef.current?.fillField(params.fieldName, params.value);
});
```

**Loose Coupling**:
- Form doesn't know about chatbot
- Chatbot library doesn't know about form
- Communication via refs and events
- Can swap implementations easily

**File Structure**:
```
apps/demo/
├── src/
│   ├── components/
│   │   ├── ContactForm.tsx
│   │   └── ChatbotPanel.tsx
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
```

## Data Flow

### Chat Message Flow

```
1. User types message in Thread component
   ↓
2. Chatbot component sends to backend via fetch
   ↓
3. ChatController receives and forwards to AIService
   ↓
4. AIService:
   - Loads conversation history
   - Calls Bedrock with messages + tools
   - Streams response back
   ↓
5. Streaming response flows back to frontend
   ↓
6. Thread component displays message incrementally
```

### Tool Execution Flow

```
1. AI decides to call a tool (e.g., form_interaction)
   ↓
2. Backend executes tool (FormInteractionTool.execute)
   ↓
3. Tool returns instruction object
   ↓
4. Backend sends instruction to AI
   ↓
5. AI sends instruction to frontend in response
   ↓
6. Frontend tool handler (useToolRegistry) processes instruction
   ↓
7. Handler calls formRef.current.fillField()
   ↓
8. Form updates with AI-provided data
```

## Design Patterns Summary

| Pattern | Location | Purpose |
|---------|----------|---------|
| **Facade** | `Chatbot` component | Simplify complex API |
| **Observer** | `EventBus` | Event-driven communication |
| **Registry** | `ToolRegistry` | Dynamic tool registration |
| **Strategy** | Tool implementations | Interchangeable algorithms |
| **Repository** | `IConversationRepository` | Abstract data access |
| **Dependency Injection** | NestJS modules | Loose coupling |
| **Command** | Form interaction tool | Encapsulate requests |
| **Factory** | Tool registration | Object creation |
| **Template Method** | `AIService.streamChatCompletion` | Algorithm skeleton |
| **Result** | Tool return types | Structured error handling |

## Technology Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **@assistant-ui/react**: Chat UI primitives
- **@assistant-ui/react-ui**: Styled components

### Backend
- **NestJS**: Backend framework
- **TypeScript**: Type safety
- **Bun**: Runtime and package manager
- **AWS Bedrock**: AI provider
- **AI SDK**: Streaming utilities
- **Zod**: Schema validation
- **Cheerio**: HTML parsing

### Infrastructure
- **Bun Workspaces**: Monorepo management
- **AWS Bedrock**: Managed AI service
- **In-Memory Storage**: Conversation history (can be replaced with DB)

## Security Considerations

1. **Environment Variables**: Sensitive data in .env files
2. **CORS**: Configured for frontend origin
3. **Input Validation**: Zod schemas for tool parameters
4. **Error Handling**: Try-catch with proper error messages
5. **Abort Signals**: Request cancellation support
6. **HTML Sanitization**: Should be added for web scraping results

## Scalability Considerations

1. **Modular Architecture**: Easy to add new features
2. **Repository Pattern**: Can swap storage backends
3. **Tool System**: Easy to add new AI capabilities
4. **Event-Driven**: Loose coupling enables scaling
5. **Streaming**: Efficient for long responses
6. **Stateless Backend**: Easy to horizontally scale

## Future Enhancements

1. **Database Integration**: Replace in-memory storage
2. **Authentication**: User sessions and auth
3. **Rate Limiting**: Protect against abuse
4. **Caching**: Redis for conversation cache
5. **Monitoring**: Logging and metrics
6. **Testing**: Unit and integration tests
7. **CI/CD**: Automated deployment pipeline
8. **Documentation**: OpenAPI/Swagger for backend

## Testing Strategy

### Unit Tests
- Tool implementations
- Repository implementations
- Service business logic
- Event bus and registry

### Integration Tests
- Backend API endpoints
- AI service with mock Bedrock
- End-to-end chat flow

### E2E Tests
- Full user scenarios
- Form interaction via AI
- Search and scraping

## Conclusion

This architecture demonstrates:
- ✅ SOLID principles
- ✅ Design patterns
- ✅ Clean Architecture
- ✅ Type safety
- ✅ Loose coupling
- ✅ Extensibility
- ✅ Maintainability
- ✅ Testability
