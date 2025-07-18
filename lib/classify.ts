import { OpenAI } from "openai";
import { parseEvents } from './memory';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export async function classifyIntent(input: string): Promise<ToolIntent[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
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
    ],
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  return JSON.parse(content);
}

// Function for vanilla LLM responses using event-based memory
export async function getLLMResponse(threadXML: string, systemMessage?: string): Promise<string> {
  
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
  

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
}

// Function for streaming LLM responses using event-based memory
export async function getLLMResponseStream(threadXML: string, systemMessage?: string) {
  
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
  

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    temperature: 0.7,
    stream: true,
  });

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
