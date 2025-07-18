import { NextRequest, NextResponse } from 'next/server';
import { classifyIntent, getLLMResponse } from '@/lib/classify';
import { tools } from '@/lib/tools';
import { addEvent } from '@/lib/memory';

let threadXML = ""; // Simple in-memory store. Replace with DB or file store as needed.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, systemMessage } = body;

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    // Add user input as an event
    threadXML = await addEvent(threadXML, 'user_input', input);

    // Tool execution - classify all tools from the input at once
    const toolIntents = await classifyIntent(input);
    
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
        } else {
          toolOutput = `Invalid arguments for tool: ${intent}`;
        }
        
        // Add tool execution as an event
        threadXML = await addEvent(threadXML, intent, toolOutput);
      }
    }

    // Final LLM response after all tools have been executed
    const llmResponse = await getLLMResponse(threadXML + "\n\n Response:", systemMessage);
    threadXML = await addEvent(threadXML, 'llm_response', llmResponse);

    return NextResponse.json({ 
      response: llmResponse, 
      memory: threadXML 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
