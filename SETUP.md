# Setup Guide

## Prerequisites

Before you begin, ensure you have:

1. **Bun** installed (v1.0+)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **AWS Account** with Bedrock access
   - Enable Anthropic Claude models in your region
   - Create IAM user with Bedrock permissions

3. **Node.js** (v18+) - Optional, for compatibility checking

## Step 1: Install Dependencies

From the project root:

```bash
bun install
```

This will install all dependencies for the monorepo including:
- Frontend packages
- Backend packages
- Shared packages

## Step 2: Configure AWS Credentials

### Option A: Environment Variables

Edit `apps/backend/.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Option B: AWS CLI Profile

If you have AWS CLI configured, the backend will automatically use your default profile. You can still set the region and model in `.env`:

```env
AWS_REGION=us-east-1
BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Available Claude Models on Bedrock

- `anthropic.claude-3-5-sonnet-20241022-v2:0` (Recommended)
- `anthropic.claude-3-5-sonnet-20240620-v1:0`
- `anthropic.claude-3-haiku-20240307-v1:0`
- `anthropic.claude-3-opus-20240229-v1:0`

## Step 3: Configure Frontend

Edit `apps/demo/.env`:

```env
VITE_API_URL=http://localhost:3000/api/chat
```

If your backend runs on a different port, update the URL accordingly.

## Step 4: Build the Component Library

The demo app depends on the chatbot UI library, so build it first:

```bash
bun run build:ui
```

This creates the distributable package in `packages/chatbot-ui/dist/`.

## Step 5: Start the Backend

In a terminal:

```bash
bun run dev:backend
```

You should see:
```
🚀 Backend server running on http://localhost:3000
📡 Chat API available at http://localhost:3000/api/chat
```

## Step 6: Start the Demo App

In another terminal:

```bash
bun run dev:demo
```

You should see:
```
VITE v6.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 7: Access the Application

Open your browser to:
```
http://localhost:5173
```

You should see:
- Contact form on the left
- Chatbot panel on the right

## Testing the Setup

### Test 1: Basic Chat

In the chatbot, type:
```
Hello! Can you help me?
```

Expected: AI responds with a greeting.

### Test 2: Form Filling

In the chatbot, type:
```
Fill the form with name "John Doe", email "john@example.com", and subject "Test"
```

Expected: Form fields populate automatically.

### Test 3: Web Scraping

In the chatbot, type:
```
Scrape the content from https://example.com
```

Expected: AI returns the scraped content.

### Test 4: Search

In the chatbot, type:
```
Search for "TypeScript best practices"
```

Expected: AI returns search results.

## Troubleshooting

### Backend Issues

**Error: AWS credentials not found**
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env`
- Or ensure AWS CLI is configured: `aws configure`

**Error: Bedrock model not found**
- Check that you've enabled the model in AWS Bedrock console
- Verify the model ID matches available models in your region
- Some models require requesting access

**Error: CORS error**
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both backend and frontend are running

### Frontend Issues

**Error: Cannot connect to backend**
- Verify backend is running on the expected port
- Check `VITE_API_URL` in `apps/demo/.env`
- Open browser dev tools to see network requests

**Error: Module not found '@chatbot-monorepo/ui'**
- Run `bun run build:ui` to build the library
- Verify `packages/chatbot-ui/dist/` exists

**Chatbot not rendering**
- Check browser console for errors
- Verify all dependencies are installed
- Try rebuilding: `bun install && bun run build:ui`

### Build Issues

**TypeScript errors**
- Run `bun install` to ensure all types are available
- Check that TypeScript version is 5.7+

**Bun errors**
- Update Bun: `bun upgrade`
- Clear cache: `rm -rf node_modules && bun install`

## Development Tips

### Hot Reload

Both backend and frontend support hot reload:
- Backend: Changes trigger automatic restart
- Frontend: Changes trigger instant HMR

### Debugging

**Backend Debugging:**
```bash
# Enable debug logs
DEBUG=* bun run dev:backend
```

**Frontend Debugging:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls

### Adding New Tools

1. Create tool in `apps/backend/src/application/tools/`
2. Implement `ITool` interface
3. Register in `apps/backend/src/app.module.ts`
4. Restart backend

Example:
```typescript
@Injectable()
export class MyTool implements ITool<MyParams, MyResult> {
  readonly name = 'my_tool';
  readonly description = 'What my tool does';
  readonly parametersSchema = z.object({
    param1: z.string(),
  });

  async execute(params: MyParams): Promise<MyResult> {
    // Implementation
  }
}
```

### Testing Tool Handlers

In the demo app, register custom handlers:

```typescript
// In ChatbotPanel.tsx
useToolRegistry('my_tool', async (params) => {
  console.log('Tool called with:', params);
  return { success: true, data: 'result' };
});
```

## Production Deployment

### Environment Variables

Create production `.env` files with:
- Secure AWS credentials (use IAM roles if possible)
- Production API URLs
- Appropriate CORS settings

### Build for Production

```bash
# Build all packages
bun run build

# Or individually
bun run build:ui
bun run build:backend
bun run build:demo
```

### Deploy Backend

1. Use PM2, Docker, or serverless
2. Set environment variables
3. Enable HTTPS
4. Configure rate limiting
5. Set up monitoring

### Deploy Frontend

1. Build: `bun run build:demo`
2. Deploy `apps/demo/dist/` to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Your hosting provider

### Security Checklist

- [ ] AWS credentials use IAM roles (not hardcoded)
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Monitoring and logging configured

## Scripts Reference

From project root:

```bash
# Development
bun run dev:backend          # Start backend in dev mode
bun run dev:demo            # Start demo app in dev mode

# Building
bun run build               # Build all packages
bun run build:ui            # Build component library only
bun run build:backend       # Build backend only
bun run build:demo          # Build demo app only

# From individual packages
cd packages/chatbot-ui
bun run dev                 # Watch mode for library

cd apps/backend
bun run start               # Production start
bun run start:dev           # Development start

cd apps/demo
bun run preview             # Preview production build
```

## Next Steps

1. **Customize the UI**: Modify styles in `apps/demo/src/styles.css`
2. **Add Tools**: Create new tools in the backend
3. **Extend Forms**: Add more form fields or new forms
4. **Database**: Replace in-memory repository with database
5. **Authentication**: Add user authentication
6. **Deploy**: Follow production deployment guide

## Getting Help

- Check `README.md` for overview
- Check `ARCHITECTURE.md` for design details
- Review code comments for implementation details
- AWS Bedrock docs: https://docs.aws.amazon.com/bedrock/
- assistant-ui docs: https://www.assistant-ui.com/docs

## Common Tasks

### Change AI Model

Edit `apps/backend/.env`:
```env
BEDROCK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
```

Restart backend.

### Change Backend Port

1. Edit `apps/backend/.env`:
   ```env
   PORT=4000
   ```

2. Edit `apps/demo/.env`:
   ```env
   VITE_API_URL=http://localhost:4000/api/chat
   ```

3. Restart both servers.

### Add Conversation Persistence

Replace `InMemoryConversationRepository` with a database implementation:

```typescript
// apps/backend/src/infrastructure/repositories/postgres-conversation.repository.ts
@Injectable()
export class PostgresConversationRepository implements IConversationRepository {
  // Implement using Prisma, TypeORM, etc.
}
```

Update `app.module.ts`:
```typescript
{
  provide: IConversationRepository,
  useClass: PostgresConversationRepository,
}
```

## Congratulations!

You now have a fully functional AI chatbot system. Explore the code, experiment with tools, and build amazing conversational interfaces!
