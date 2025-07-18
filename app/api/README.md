# API Routes

This directory contains the API routes for the Simple AF Agent application.

## `/agent` Route

**File**: `app/api/agent/route.ts`

### Overview
The main API endpoint that handles AI agent interactions, tool execution, and streaming responses.

### Endpoint
```
POST /api/agent
```

### Request Body
```typescript
{
  input: string;          // User message/query
  systemMessage: string;  // AI system prompt
  stream?: boolean;       // Enable streaming responses (default: true)
}
```

### Response Formats

#### Streaming Response (Server-Sent Events)
When `stream: true` (default), the API returns Server-Sent Events:

```typescript
// Content-Type: text/event-stream

// Memory initialization
data: {"type": "memory", "memory": "<xml>...</xml>"}

// Streaming content chunks
data: {"type": "content", "content": "Hello "}
data: {"type": "content", "content": "world!"}

// Completion
data: {"type": "complete", "memory": "<xml>...</xml>"}

// Error handling
data: {"type": "error", "error": "Error message"}
```

#### Regular JSON Response (Fallback)
When `stream: false` or streaming fails:

```typescript
{
  response: string;  // AI response text
  memory: string;    // XML conversation context
}
```

### Processing Flow

1. **Input Validation**: Validates required `input` parameter
2. **Memory Management**: Adds user input to conversation memory
3. **Tool Classification**: Uses AI to identify tool requests (supports multiple tools)
4. **Tool Execution**: Executes all identified tools in sequence
5. **Response Generation**: Generates AI response via streaming or regular API
6. **Memory Update**: Updates conversation context with results

### Tool Integration

The API automatically handles tool execution:

#### Supported Tools
- **Weather**: `get_weather({ location: string })`
- **Stock Info**: `get_stock_info({ ticker: string })`

#### Multiple Tool Support
Can handle multiple tools in a single request:
```
"weather in New York and price of TSLA"
→ Executes both get_weather and get_stock_info
```

### Error Handling

- **400 Bad Request**: Missing required `input` parameter
- **500 Internal Server Error**: AI API failures, tool execution errors
- **Streaming Errors**: Sent via SSE error events, client handles gracefully

### Memory System

Uses XML-based conversation tracking:
```xml
<thread>
  <event intent="user_input">User message</event>
  <event intent="get_weather" type="tool" status="success" done="true">Weather data</event>
  <event intent="llm_response">AI response</event>
</thread>
```

### Architecture Benefits

1. **Streaming First**: Real-time response delivery for better UX
2. **Tool Orchestration**: Automatic tool discovery and execution
3. **Memory Persistence**: Conversation context maintained across requests
4. **Error Resilience**: Graceful fallback for streaming failures
5. **Type Safety**: Comprehensive TypeScript typing throughout

### Environment Dependencies

- `OPENAI_API_KEY` - Required for AI completions and tool classification
- OpenAI API access for streaming and completion endpoints

### Performance Considerations

- **Streaming**: Reduces perceived latency for long responses
- **Parallel Tool Execution**: Multiple tools executed in sequence (not parallel)
- **Memory Management**: XML parsing overhead minimal for typical conversations
- **Rate Limiting**: Inherits OpenAI API rate limits

### Usage Example

```typescript
// Client-side streaming consumption
const response = await fetch('/api/agent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: "What's the weather in Boston?",
    systemMessage: "You are a helpful assistant.",
    stream: true
  })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (reader) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Handle different event types
    }
  }
}
```

### Integration Points

- **Main Page**: `app/page.tsx` handles streaming consumption and user interface
- **Library**: Uses `classify.ts` for intent recognition and `tools.ts` for execution
- **Memory**: Integrates with `memory.ts` for conversation tracking

### Future Enhancements

- **Parallel Tool Execution**: Execute multiple tools simultaneously
- **Streaming Tool Results**: Stream individual tool results as they complete
- **Rate Limiting**: Implement request rate limiting
- **Caching**: Cache tool results for performance
- **Authentication**: Add user authentication and session management