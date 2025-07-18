# Simple AF Agent

An AI-powered chat application built with Next.js 15 that provides intelligent conversation capabilities with integrated tools for weather and stock information. Features real-time streaming responses, modular component architecture, and a clean, responsive user interface.

## 🚀 Features

- **Real-time Streaming**: OpenAI-powered responses with live text generation
- **Smart Tool Integration**: Weather information and stock data retrieval
- **Multiple Tool Execution**: Handle multiple tool requests in a single query
- **Configurable System Messages**: Customize AI behavior and personality
- **Memory Management**: XML-based conversation context tracking
- **Responsive Design**: Mobile-friendly chat interface
- **Focus Management**: Seamless input focus for continuous conversation flow
- **Error Handling**: Graceful degradation for API failures

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **AI Integration**: OpenAI API for completions and streaming
- **Tools**: yahoo-finance2 for stock data, custom weather API
- **Memory**: xml2js for conversation context management

## 🏗️ Architecture

The application uses a single-page architecture with all UI components integrated into the main page:

- **Single Page Component**: All chat interface, input handling, and system message editing in `app/page.tsx`
- **API Routes**: Streaming responses and tool execution via `/api/agent`
- **Library Functions**: AI classification, tool execution, and memory management in `/lib`

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:

```bash
# Create a .env.local file in the root directory
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 Usage

1. **Start a Conversation**: Type your message and press Enter
2. **Use Tools**: Ask for weather information or stock prices
   - "What's the weather in New York?"
   - "What's the price of TSLA?"
   - "Weather in Boston and price of AAPL" (multiple tools)
3. **Configure System Message**: Click the settings icon to customize AI behavior
4. **View Context**: The XML context window shows conversation history and tool results

## 📝 Development Commands

- `npm run dev` - Start development server with Turbopack for fast builds
- `npm run build` - Build production version
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## 🔧 Adding New Tools

To add a new tool:

1. Add the tool function to `lib/tools.ts`
2. Update intent classification in `lib/classify.ts`
3. Add tool execution logic in `app/api/agent/route.ts`

## 🎨 Customization

- **Styling**: Modify Tailwind classes in components
- **System Messages**: Use the settings panel or edit localStorage
- **AI Behavior**: Update prompts in `lib/classify.ts`
- **UI Components**: Customize the main page component in `app/page.tsx`

## 📦 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/agent/         # AI agent API route
│   └── page.tsx           # Main application page (single-file architecture)
├── components/ui/         # shadcn/ui components
│   └── button.tsx         # Button component
├── lib/                   # Utility functions and AI logic
│   ├── classify.ts        # AI intent classification
│   ├── tools.ts           # Tool definitions
│   ├── memory.ts          # Conversation memory management
│   └── utils.ts           # Utility functions
└── public/               # Static assets
```

## 🚀 Deployment

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Connect your GitHub repository to Vercel
2. Add your `OPENAI_API_KEY` environment variable
3. Deploy automatically on push to main branch

For other deployment options, check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
