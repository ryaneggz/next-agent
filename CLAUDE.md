# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **Simple AF Agent** - an AI-powered chat application built with Next.js 15 that provides intelligent conversation capabilities with tool integration for weather and stock information. The application features real-time streaming responses, single-page architecture, and a clean, responsive user interface.

## Development Commands

- `npm run dev` - Start development server with Turbopack for fast builds
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Architecture & Structure

This is a Next.js 15 application using the App Router architecture with AI agent capabilities and single-page design.

### Framework & Dependencies
- **Next.js 15** with App Router (`app/` directory structure)
- **TypeScript** with strict mode enabled
- **Tailwind CSS v4** for styling with PostCSS integration
- **shadcn/ui** component library using Radix UI primitives
- **OpenAI API** for AI completions and streaming
- **yahoo-finance2** for stock information
- **xml2js** for XML parsing and memory management

### Key Directories
- `app/` - Next.js App Router pages, layouts, and API routes
- `components/ui/` - Reusable shadcn/ui components
- `lib/` - Utility functions, AI classification, tools, and memory management
- `public/` - Static assets

### AI Agent Features
- **Streaming Responses**: Real-time text generation using OpenAI's streaming API
- **Tool Integration**: Weather information and stock data retrieval
- **Multiple Tool Execution**: Can handle multiple tool requests in a single query
- **Memory Management**: XML-based conversation context and tool result storage
- **System Message Configuration**: Customizable AI behavior and personality

### Component Architecture
The application uses a single-page component architecture with:
- **Main Page** (`app/page.tsx`): Contains all chat interface, input handling, system message editing, and state management
- **Inline Components**: Chat messages, input area, system message editor, and XML context window are all integrated into the main page component

### Styling Approach
- **Tailwind CSS v4** as the primary styling solution
- **Custom gradient backgrounds** with responsive design
- **Chat bubble UI** with user/agent message differentiation
- **Loading animations** and streaming indicators
- **Responsive layout** optimized for desktop and mobile

### Development Patterns
- **Single-Page Architecture**: All UI components integrated into one main page component
- **TypeScript Interfaces**: Proper typing for API responses and data structures
- **React Hooks**: State management and side effects with useState and useEffect
- **useRef**: For scroll management and DOM access
- **Error Boundaries**: Graceful error handling for streaming and API failures
- **Focus Management**: Automatic input focus for seamless UX

### API Architecture
- **Streaming API**: Server-Sent Events for real-time response delivery
- **Tool Classification**: AI-powered intent recognition for tool selection
- **Memory System**: Event-based conversation tracking with XML storage
- **Error Handling**: Comprehensive error handling with user feedback

### Configuration Files
- `tsconfig.json` - TypeScript configuration with Next.js plugin
- `components.json` - shadcn/ui configuration
- `next.config.ts` - Next.js configuration (minimal setup)
- `postcss.config.mjs` - PostCSS configuration for Tailwind

## Important Development Guidelines

When working with this codebase:

1. **Component Structure**: The app uses a single-page architecture with all UI components integrated into `app/page.tsx`. New features should be added to this main component.

2. **State Management**: Application state is managed through React hooks (useState, useEffect) in the main page component. All state logic is contained within this single component.

3. **API Integration**: The `/api/agent` route handles streaming responses and tool execution. Changes to AI behavior should be made in `lib/classify.ts` and tool definitions in `lib/tools.ts`.

4. **Memory System**: Conversation context is stored in XML format using the memory system in `lib/memory.ts`. This tracks user inputs, tool executions, and AI responses.

5. **Tool Development**: To add new tools:
   - Add tool function to `lib/tools.ts`
   - Update intent classification in `lib/classify.ts`
   - Add tool execution logic in `app/api/agent/route.ts`

6. **Styling**: Use Tailwind CSS classes consistently. The app uses a blue/indigo gradient theme with rounded corners and shadows.

7. **TypeScript**: All components and functions should be properly typed. Use interfaces for component props and API responses.

8. **Testing**: Test changes using the browser interface. Focus on streaming responses, tool execution, and component interactions.

## Environment Setup

Ensure you have the following environment variables configured:
- `OPENAI_API_KEY` - Required for AI completions and streaming

## Key Features to Maintain

- **Streaming Responses**: Real-time text generation with proper error handling
- **Multiple Tool Execution**: Handle multiple tool requests in a single query
- **Focus Management**: Automatic input focus after responses
- **Scroll Behavior**: Smart scrolling during streaming responses
- **System Message Persistence**: localStorage integration for system prompts
- **Responsive Design**: Mobile-friendly chat interface
- **Error Handling**: Graceful degradation for API failures

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.