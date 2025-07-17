import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function classifyIntent(input: string): Promise<{ tool: string, args: any }> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "user",
      content: `
You are a JSON tool classifier.
Return only a JSON object: { "tool": "get_weather", "args": { "location": "Dallas" } }
Input: "${input}"`,
    }],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content);
}
