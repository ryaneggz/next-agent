import { OpenAI } from "openai";
import { parseEvents } from './memory';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GetWeather {
  intent: "get_weather";
  args: { location: string };
}

interface NoTool {
  intent: "none";
  args: {};
}

type ClassificationResult = GetWeather | NoTool;

export async function classifyIntent(input: string): Promise<ClassificationResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `
You are a JSON tool classifier. 
If the input is a request to get the weather for a location, return only a JSON object in this format: { "intent": "get_weather", "args": { "location": "<city>" } }
If the input is not a tool request, return only a JSON object in this format: { "intent": "none", "args": {} }
Do not include any other text or explanation.
        `.trim(),
      },
      {
        role: "user",
        content: input,
      },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}

// Function for vanilla LLM responses using event-based memory
export async function getLLMResponse(threadXML: string): Promise<string> {
  
  // Convert events to conversation format for LLM
  const messages: { role: "user" | "assistant"|"system", content: string }[] = [
    {
      role: "system",
      content: "You are a helpful AI assistant. Respond naturally and conversationally based on the conversation history."
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

// Function to get the latest context for tool classification
export function getLatestContext(threadXML: string): string {
  const events = parseEvents(threadXML);
  if (events.length === 0) return "";
  
  // Get the last few events to understand current context
  const recentEvents = events.slice(-3);
  return recentEvents.map(e => `${e.intent}: ${e.content}`).join('\n');
}
