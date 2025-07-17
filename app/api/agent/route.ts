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

    // Tool execution loop
    let currentInput = input;
    const maxIterations = 5; // Prevent infinite loops
    let iteration = 0;

    while (iteration < maxIterations) {
      const { intent, args } = await classifyIntent(currentInput);
      
      if (intent === 'none') {
        // No more tools to execute, break the loop
        break;
      }
      
      if (intent in tools) {
        let toolOutput: string;
        
        // Execute the specific tool
        if (intent === 'get_weather' && 'location' in args) {
          toolOutput = tools.get_weather(args as { location: string });
        } else {
          toolOutput = `Invalid arguments for tool: ${intent}`;
        }
        
        // Add tool execution as an event
        threadXML = await addEvent(threadXML, intent, toolOutput);
        
        // After executing a tool, ask if any additional tools are needed
        // instead of re-classifying the original input
        currentInput = "Are there any additional tools needed based on the current conversation?";
      } else {
        // Unknown tool, break the loop
        break;
      }
      
      iteration++;
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
