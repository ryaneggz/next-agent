# Library Components

This directory contains the core utility functions and AI logic for the Simple AF Agent application.

## Structure

### `classify.ts`
- **Intent Classification**: AI-powered tool intent recognition using OpenAI
- **Functions**:
  - `classifyIntent()` - Analyzes user input to identify tool requests (supports multiple tools)
  - `getLLMResponse()` - Generates regular AI responses
  - `getLLMResponseStream()` - Generates streaming AI responses
  - `getLatestContext()` - Extracts recent conversation context
- **Tool Support**: Weather and stock information classification
- **Multiple Tools**: Can identify and return multiple tool intents from a single query

### `tools.ts`
- **Tool Definitions**: Available tools for the AI agent
- **Tools**:
  - `get_weather()` - Weather information retrieval (stubbed implementation)
  - `get_stock_info()` - Stock data using yahoo-finance2 API
- **Integration**: Used by the agent API route for tool execution
- **Extensible**: Easy to add new tools by adding functions to the tools object

### `memory.ts`
- **Conversation Memory**: XML-based conversation context management
- **Functions**:
  - `addEvent()` - Adds events (user input, tool results, AI responses) to memory
  - `parseEvents()` - Parses XML memory to extract conversation events
- **Format**: XML structure with event types and metadata
- **Persistence**: Maintains conversation context across interactions

### `utils.ts`
- **Utility Functions**: Shared helper functions (from shadcn/ui)
- **Functions**:
  - `cn()` - Tailwind CSS class merging utility
- **Type Safety**: Proper TypeScript implementations

### `types/agent.ts`
- **TypeScript Interfaces**: Type definitions for agent components
- **Types**: Shared interfaces for components, API responses, and tool definitions
- **Consistency**: Ensures type safety across the application

## Architecture Benefits

1. **Separation of Concerns**: Clear division between AI logic, tool execution, and memory management
2. **Reusability**: Functions can be used across different components and API routes
3. **Type Safety**: Comprehensive TypeScript typing throughout
4. **Extensibility**: Easy to add new tools, memory formats, or AI capabilities
5. **Testability**: Pure functions that can be easily unit tested

## Integration Points

### API Route (`/app/api/agent/route.ts`)
- Uses `classifyIntent()` to identify tool requests
- Executes tools from `tools.ts` 
- Manages conversation memory with `memory.ts`
- Streams responses using `getLLMResponseStream()`

### Components
- Components use types from `types/agent.ts`
- UI components use `utils.ts` for styling
- Memory display uses `memory.ts` for parsing XML context

## Adding New Tools

To add a new tool:

1. **Add Tool Function** in `tools.ts`:
```typescript
export const tools = {
  // existing tools...
  my_new_tool: async ({ param }: { param: string }) => {
    // Implementation here
    return "Tool result";
  }
};
```

2. **Update Classification** in `classify.ts`:
```typescript
interface MyNewTool {
  intent: "my_new_tool";
  args: { param: string };
}

type ToolIntent = GetWeather | GetStockInfo | MyNewTool | NoTool;
```

3. **Add Execution Logic** in the API route:
```typescript
else if (intent === 'my_new_tool' && 'param' in args) {
  toolOutput = await tools.my_new_tool(args as { param: string });
}
```

## Environment Requirements

- `OPENAI_API_KEY` - Required for AI classification and response generation
- Node.js 18+ for modern JavaScript features
- TypeScript for type safety 