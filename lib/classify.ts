import { initChatModel } from "langchain/chat_models/universal";
import { parseEvents } from './memory';
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import ChatModels from "./types/llm";

let model: BaseChatModel | null = null;

async function getModel(modelName?: string) {
  const selectedModel = modelName || ChatModels.OPENAI_GPT_4_1_MINI;
  
  // Always create a new model instance if a specific model is requested
  if (modelName || !model) {
    model = await initChatModel(selectedModel, {
      // temperature: 0.7,
    });
  }
  return model;
}

interface GetWeather {
  intent: "get_weather";
  args: { location: string };
}

interface GetStockInfo {
  intent: "get_stock_info";
  args: { ticker: string };
}

interface NoTool {
  intent: "none";
  args: Record<string, never>;
}

type ToolIntent = GetWeather | GetStockInfo | NoTool;

export async function classifyIntent(input: string, modelName?: string): Promise<ToolIntent[]> {
  const model = await getModel(modelName);
  const response = await model.invoke([
    {
      role: "system",
      content: `
You are a JSON tool classifier that can identify multiple tool requests in a single input.
Analyze the input and identify ALL tool requests present. Return a JSON array of tool objects.

For weather requests, use this format: { "intent": "get_weather", "args": { "location": "<city>" } }
For stock information requests, use this format: { "intent": "get_stock_info", "args": { "ticker": "<ticker>" } }
If no tools are needed, return: [{ "intent": "none", "args": {} }]

Examples:
- "weather in dallas" → [{ "intent": "get_weather", "args": { "location": "dallas" } }]
- "price of tsla" → [{ "intent": "get_stock_info", "args": { "ticker": "tsla" } }]
- "weather in dallas, price of tsla" → [{ "intent": "get_weather", "args": { "location": "dallas" } }, { "intent": "get_stock_info", "args": { "ticker": "tsla" } }]
- "how are you today?" → [{ "intent": "none", "args": {} }]

Return only the JSON array, no other text.
        `.trim(),
    },
    {
      role: "user",
      content: input,
    },
  ]);

  const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content) ?? "[]";
  return JSON.parse(content);
}

// Function for vanilla LLM responses using event-based memory
export async function getLLMResponse(threadXML: string, systemMessage?: string, modelName?: string): Promise<string> {
  
  // Convert events to conversation format for LLM
  const messages: { role: "user" | "assistant"|"system", content: string }[] = [
    {
      role: "system",
      content: systemMessage || "You are a helpful AI assistant. Respond naturally and conversationally based on the conversation history."
    },
		{
			role: "user",
			content: threadXML
		}
  ];

  const model = await getModel(modelName);
  const response = await model.invoke(messages);

  return typeof response.content === 'string' ? response.content : JSON.stringify(response.content) ?? "I'm sorry, I couldn't generate a response.";
}

// Function for streaming LLM responses using event-based memory
export async function getLLMResponseStream(threadXML: string, systemMessage?: string, modelName?: string) {
  
  // Convert events to conversation format for LLM
  const messages: { role: "user" | "assistant"|"system", content: string }[] = [
    {
      role: "system",
      content: systemMessage || "You are a helpful AI assistant. Respond naturally and conversationally based on the conversation history."
    },
	{
		role: "user",
		content: threadXML
	}
  ];

  const model = await getModel(modelName);
  const response = model.stream(messages);

  return response;
}

// Function to get the latest context for tool classification
export function getLatestContext(threadXML: string): string {
  const events = parseEvents(threadXML);
  if (events.length === 0) return "";
  
  // Get the last few events to understand current context
  const recentEvents = events.slice(-3);
  return recentEvents.map(e => `${e.intent}: ${e.content}`).join('\n');
}
