import { initChatModel } from "langchain/chat_models/universal";
import { agentMemory, ThreadState, getLatestContext } from './memory';
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import ChatModels from "./types/llm";
import { tools } from "./tools";
import YAML from 'yaml'

let model: BaseChatModel | null = null;

async function getModel(modelName?: ChatModels) {
  const selectedModel = modelName || ChatModels.OPENAI_GPT_4_1_MINI;
  
  // Always create a new model instance if a specific model is requested
  if (modelName || !model) {
    model = await initChatModel(selectedModel.toString(), {
      // temperature: 0.7,
    });
  }
  return model;
}

// Define tool intent interfaces
interface WeatherIntent {
  intent: 'get_weather';
  args: { location: string };
}

interface StockIntent {
  intent: 'get_stock_info';
  args: { ticker: string };
}

interface WebSearchIntent {
  intent: 'web_search';
  args: { query: string };
}

interface MathIntent {
  intent: 'math_calculator';
  args: { expression: string };
}

interface NoIntent {
  intent: 'none';
  args: Record<string, never>;
}

type ToolIntent = WeatherIntent | StockIntent | WebSearchIntent | MathIntent | NoIntent;

export async function classifyIntent(query: string, modelName?: string): Promise<ToolIntent[]> {
  const prompt = `
Analyze the following user query and identify if any tools should be executed. Return a JSON array of tool intents.

Available tools:
1. "get_weather" - for weather information requests (args: {"location": "city name"})
2. "get_stock_info" - for stock price requests (args: {"ticker": "STOCK_SYMBOL"}) 
3. "web_search" - for general information searches (args: {"query": "search terms"})
4. "math_calculator" - for mathematical calculations (args: {"expression": "math expression"})

If no tools are needed, return: [{"intent": "none", "args": {}}]

Examples:
- "weather in NYC" → [{"intent": "get_weather", "args": {"location": "New York City"}}]
- "TSLA stock price" → [{"intent": "get_stock_info", "args": {"ticker": "TSLA"}}]
- "weather in Boston and price of AAPL" → [{"intent": "get_weather", "args": {"location": "Boston"}}, {"intent": "get_stock_info", "args": {"ticker": "AAPL"}}]
- "calculate 15 * 23" → [{"intent": "math_calculator", "args": {"expression": "15 * 23"}}]
- "search for latest AI news" → [{"intent": "web_search", "args": {"query": "latest AI news"}}]

User query: "${query}"

Respond with only the JSON array, no additional text.
  `;

  const messages = [
    { role: "user", content: prompt }
  ];

  const model = await getModel(modelName as ChatModels);
  const response = await model.invoke(messages);

  const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content) ?? "[]";
  return JSON.parse(content);
}

export async function getLLMResponse(
  ctxWindow: string,
  systemMessage: string,
  modelName: ChatModels = ChatModels.OPENAI_GPT_4_1_MINI,
): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const messages = [
    { role: "system", content: systemMessage },
    { role: "user", content: ctxWindow }
  ];

  const model = await getModel(modelName);
  const response = await model.invoke(messages);

  return response.content;
}

export async function getLLMResponseStream(
  ctxWindow: string,
  systemMessage: string,
  modelName: ChatModels = ChatModels.OPENAI_GPT_4_1_MINI,
) {
  const messages = [
    { role: "system", content: systemMessage },
    { role: "user", content: ctxWindow }
  ];

  const model = await getModel(modelName);
  const response = model.stream(messages);

  return response;
}

export async function agentLoop(
  query: string, 
  state: ThreadState,
  model: ChatModels = ChatModels.OPENAI_GPT_4_1_MINI,
) {
  // Tool execution - classify all tools from the input at once
  const toolIntents = await classifyIntent(query, model.toString());
  
  // Execute all identified tools
  for (const toolIntent of toolIntents) {
    const { intent, args } = toolIntent;
    
    if (intent === 'none') {
      // No tools to execute, continue to LLM response
      continue;
    }
    
    if (intent in tools) {
      let toolOutput: string;
      
      // Execute the specific tool
      if (intent === 'get_weather' && 'location' in args) {
        toolOutput = tools.get_weather(args as { location: string });
      } else if (intent === 'get_stock_info' && 'ticker' in args) {
        toolOutput = await tools.get_stock_info(args as { ticker: string });
      } else if (intent === 'math_calculator' && 'expression' in args) {
        const result = await tools.math_calculator.invoke(args as { expression: string });
        toolOutput = result;
      } else if (intent === 'web_search' && 'query' in args) {
        const result = await tools.web_search.invoke(args as { query: string });
        toolOutput = `Search results for "${args.query}":\n${YAML.stringify(result, { indent: 2})}`;
      } else {
        toolOutput = `Invalid arguments for tool: ${intent}`;
      }
      
      // Add tool execution as an event
      state = await agentMemory(intent, toolOutput, state);
    }
  }
  return state;
}