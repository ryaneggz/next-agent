# Components

This directory contains the modular React components for the Simple AF Agent application. Each component has a single responsibility and is properly typed with TypeScript interfaces.

## Component Overview

### `ChatMessages.tsx`
**Purpose**: Displays chat messages, conversation history, and XML context window

**Features**:
- Message rendering with user/agent differentiation
- Loading states with animated indicators
- Error message handling
- XML context window with formatted display
- Scroll management via forwardRef

**Props**:
```typescript
interface ChatMessagesProps {
  log: string[];           // Array of conversation messages
  isLoading: boolean;      // Loading state for streaming
  memory: string;          // XML memory context
}
```

**Usage**:
```typescript
<ChatMessages
  ref={chatContainerRef}
  log={log}
  isLoading={isLoading}
  memory={memory}
/>
```

### `ChatInput.tsx`
**Purpose**: Handles user input, submission, and streaming response processing

**Features**:
- Input field with keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Automatic focus management
- Streaming response handling via Server-Sent Events
- Tool execution coordination
- Scroll behavior integration

**Props**:
```typescript
interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  systemMessage: string;
  onLog: (message: string) => void;
  onMemoryUpdate: (memory: string) => void;
  onScrollToLatest: () => void;
  onScrollToBottom: () => void;
}
```

**Usage**:
```typescript
<ChatInput
  onSubmit={handleSubmit}
  isLoading={isLoading}
  systemMessage={systemMessage}
  onLog={handleLog}
  onMemoryUpdate={handleMemoryUpdate}
  onScrollToLatest={scrollToShowLatestMessage}
  onScrollToBottom={scrollToBottom}
/>
```

### `SystemMessageEditor.tsx`
**Purpose**: Configurable system message editor for customizing AI behavior

**Features**:
- Expandable/collapsible editor panel
- Real-time system message editing
- localStorage persistence integration
- Clean, accessible UI with close button

**Props**:
```typescript
interface SystemMessageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  systemMessage: string;
  onSystemMessageChange: (message: string) => void;
}
```

**Usage**:
```typescript
<SystemMessageEditor
  isOpen={isSystemEditorOpen}
  onClose={() => setIsSystemEditorOpen(false)}
  systemMessage={systemMessage}
  onSystemMessageChange={setSystemMessage}
/>
```

## Component Architecture Benefits

1. **Separation of Concerns**: Each component has a single, well-defined responsibility
2. **Reusability**: Components can be easily reused or extended
3. **Type Safety**: All props are properly typed with TypeScript interfaces
4. **Testability**: Components can be tested in isolation
5. **Maintainability**: Clear interfaces make changes easier to implement

## State Management

The components follow a **lift state up** pattern where:
- Main application state is managed in the parent `page.tsx`
- Components communicate via props and callbacks
- Side effects are handled through callback functions
- Refs are used for DOM manipulation (scrolling, focus)

## Styling

All components use:
- **Tailwind CSS** for consistent styling
- **Responsive design** with mobile-first approach
- **Accessibility** considerations with proper ARIA labels
- **Consistent theme** with blue/indigo color scheme

## Integration Points

### Main Application (`app/page.tsx`)
- Orchestrates all components
- Manages global state
- Handles API integration
- Provides scroll and focus management

### API Integration
- `ChatInput` directly communicates with `/api/agent` for streaming
- Real-time updates via Server-Sent Events
- Error handling and fallback responses

### Local Storage
- `SystemMessageEditor` integrates with localStorage for persistence
- Automatic save/load of system messages

## Adding New Components

When adding new components:

1. **Create TypeScript Interface** for props
2. **Follow naming conventions** (PascalCase for components)
3. **Add to this README** with documentation
4. **Include proper typing** and error handling
5. **Test integration** with existing components

## Component Dependencies

- **React 18+** for modern hooks and features
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **forwardRef** for DOM access where needed

## Best Practices

1. **Props over State**: Pass data down via props when possible
2. **Single Responsibility**: Each component should have one clear purpose
3. **Error Boundaries**: Handle errors gracefully
4. **Accessibility**: Include proper ARIA attributes
5. **Performance**: Use React.memo() for expensive components if needed