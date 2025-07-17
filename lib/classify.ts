import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GetWeather {
  intent: "get_weather";
  args: { location: string };
}

interface NormalQuery {
  intent: "query";
  args: { query: string };
}

type ClassificationResult = GetWeather | NormalQuery;

export async function classifyIntent(input: string): Promise<ClassificationResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `
You are a JSON tool classifier. 
If the input is a request to get the weather for a location, return only a JSON object in this format: { "intent": "get_weather", "args": { "location": "<city>" } }
If the input is not a tool request, return only a JSON object in this format: { "intent": "query", "args": { "query": "<the original input>" } }
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
