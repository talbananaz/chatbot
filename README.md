# AI Chatbot Monorepo

A production-ready, SOLID-principles-based AI chatbot system with React frontend, NestJS backend, and AWS Bedrock integration.

## Architecture Overview

This monorepo contains three main packages:

### 📦 Packages

#### `packages/chatbot-ui`
React component library wrapping @assistant-ui/react with event-driven architecture.

**Key Features:**
- **Event-Driven Architecture**: Decoupled communication using Observer pattern
- **Tool Registry**: Dynamic tool registration using Registry and Strategy patterns
- **Type-Safe**: Full TypeScript support with strict typing
- **Framework Agnostic**: Core logic separated from React specifics

**Design Patterns Used:**
- Facade Pattern (Chatbot component)
- Strategy Pattern (Tool handlers)
- Observer Pattern (Event bus)
- Registry Pattern (Tool registry)
- Dependency Injection (Context API)

#### `apps/backend`
NestJS backend with AWS Bedrock integration.

**Key Features:**
- **AWS Bedrock Integration**: Uses Anthropic Claude via Bedrock
- **Conversation History**: Repository pattern for data persistence
- **AI Tools**: Web scraping, search, and form interaction
- **SOLID Architecture**: Clean separation of concerns

**Architecture Layers:**
- **Domain Layer**: Entities and repository interfaces
- **Application Layer**: Services and use cases
- **Infrastructure Layer**: Repository implementations
- **Presentation Layer**: HTTP controllers

**Tools Provided:**
1. **Web Scraper**: Extract content from web pages
2. **Search**: DuckDuckGo-based web search
3. **Form Interaction**: Event-driven form manipulation

#### `apps/demo`
React demo application showcasing chatbot integration.

**Features:**
- Contact form with AI-powered auto-fill
- Real-time chatbot interaction
- Clean, responsive UI
- Demonstrates loose coupling via refs and events

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- AWS account with Bedrock access
- AWS credentials with Bedrock permissions

### Installation

1. **Install dependencies:**
```bash
bun install
```

2. **Set up environment variables:**

Backend (apps/backend/.env):
```bash
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your AWS credentials
```

Demo (apps/demo/.env):
```bash
cp apps/demo/.env.example apps/demo/.env
# Edit if your backend runs on a different port
```

3. **Build the component library:**
```bash
bun run build:ui
```

### Running the Project

**Terminal 1 - Backend:**
```bash
bun run dev:backend
```

**Terminal 2 - Demo App:**
```bash
bun run dev:demo
```

The demo app will be available at http://localhost:5173
The backend API will be available at http://localhost:3000

## Usage Examples

### Try These Prompts

In the chatbot, try:

1. **Form Auto-Fill:**
   - "Fill the form with my name as John Doe and email john@example.com"
   - "Set the priority to high and subject to 'Technical Support'"
   - "Submit the form"

2. **Web Scraping:**
   - "Scrape the content from https://example.com"
   - "Get the title from https://github.com"

3. **Web Search:**
   - "Search for 'NestJS best practices'"
   - "Find information about AWS Bedrock"

## Project Structure

```
chatbot/
├── packages/
│   └── chatbot-ui/              # React component library
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── context/         # React context
│       │   ├── core/            # Core business logic
│       │   ├── hooks/           # React hooks
│       │   └── types/           # TypeScript types
│       └── package.json
├── apps/
│   ├── backend/                 # NestJS backend
│   │   ├── src/
│   │   │   ├── domain/          # Domain entities & interfaces
│   │   │   ├── application/     # Services & use cases
│   │   │   ├── infrastructure/  # Data access implementations
│   │   │   ├── presentation/    # HTTP controllers
│   │   │   └── config/          # Configuration
│   │   └── package.json
│   └── demo/                    # React demo app
│       ├── src/
│       │   ├── components/      # React components
│       │   └── types.ts         # TypeScript types
│       └── package.json
└── package.json                 # Root package.json
```

## SOLID Principles Implementation

### Single Responsibility Principle
- Each class/module has one reason to change
- Tools are separated (WebScraperTool, SearchTool, FormInteractionTool)
- Services handle specific domains (AIService, ConversationService)

### Open/Closed Principle
- Tool system is open for extension (new tools) but closed for modification
- Event bus allows new event types without changing core code

### Liskov Substitution Principle
- Repository interface can be replaced with different implementations
- Tool interface allows different tool implementations

### Interface Segregation Principle
- Small, focused interfaces (ITool, IConversationRepository)
- Clients only depend on methods they use

### Dependency Inversion Principle
- High-level modules depend on abstractions (interfaces)
- Repository pattern: Services depend on IConversationRepository, not concrete implementations
- Tool system: AIService depends on ITool interface

## Design Patterns Used

- **Repository Pattern**: Data access abstraction
- **Strategy Pattern**: Interchangeable algorithms (tools)
- **Observer Pattern**: Event-driven communication
- **Facade Pattern**: Simplified interface to complex subsystems
- **Registry Pattern**: Dynamic object registration
- **Dependency Injection**: Loose coupling via DI
- **Command Pattern**: Form interaction instructions
- **Factory Pattern**: Tool creation and registration

## Technologies

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: NestJS, TypeScript, Bun
- **AI**: AWS Bedrock (Anthropic Claude), AI SDK
- **UI Framework**: @assistant-ui/react
- **Build Tool**: Bun, Vite
- **Type Safety**: TypeScript, Zod

## Development

### Building

```bash
# Build all packages
bun run build

# Build specific package
bun run build:ui
bun run build:demo
bun run build:backend
```

### Adding New Tools

1. Create tool class implementing `ITool` interface in `apps/backend/src/application/tools/`
2. Register in `apps/backend/src/app.module.ts`
3. Tool automatically becomes available to AI

Example:
```typescript
@Injectable()
export class MyCustomTool implements ITool<MyParams, MyResult> {
  readonly name = 'my_tool';
  readonly description = 'Description of what my tool does';
  readonly parametersSchema = z.object({ /* ... */ });

  async execute(params: MyParams): Promise<MyResult> {
    // Implementation
  }
}
```

### Extending the Component Library

Register custom tool handlers in your app:

```typescript
import { useToolRegistry } from '@chatbot-monorepo/ui';

function MyComponent() {
  useToolRegistry('my_custom_tool', async (params) => {
    // Handle tool execution
    return { success: true, data: 'result' };
  });
}
```

## Security Notes

- Never commit `.env` files
- Rotate AWS credentials regularly
- Use IAM roles with least privilege
- Validate all tool inputs
- Sanitize web scraping results

## License

MIT

## Contributing

Contributions are welcome! Please follow the SOLID principles and existing code patterns.
