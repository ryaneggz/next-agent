# Agent Service Architecture

This directory contains the modular agent implementation with clear separation of concerns.

## Structure

### `types/agent.ts`
- Contains all TypeScript interfaces and types
- Shared across the entire agent system
- Ensures type consistency

### `agent-service.ts`
- Core business logic for the agent
- Handles conversation loops and tool calling
- Framework-agnostic and reusable
- Main exports:
  - `runAgent()` - Core agent function
  - `executeTools()` - Tool execution handler
  - `validateAgentInput()` - Input validation
  - `placeholderLLM` - Placeholder LLM for testing

### Usage in API Routes (`/app/api/agent/route.ts`)
- Thin HTTP layer that uses the agent service
- Handles request/response formatting
- Delegates business logic to the service layer

## Benefits

1. **Reusability**: Agent logic can be used in multiple contexts (API routes, CLI tools, etc.)
2. **Testability**: Business logic is separated from HTTP concerns
3. **Maintainability**: Clear separation of concerns
4. **Type Safety**: Consistent types across the entire system

## Integration

To integrate with your LLM provider, replace the `placeholderLLM` function in `agent-service.ts` with your actual implementation:

```typescript
import { openai } from '@ai-sdk/openai';

const myLLM: LLMFunction = async (messages) => {
  // Your LLM implementation here
};
``` 