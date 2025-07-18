import { NextRequest, NextResponse } from 'next/server';
import { classifyIntent, getLLMResponse, getLLMResponseStream } from '@/lib/classify';
import { tools } from '@/lib/tools';
import { addEvent } from '@/lib/memory';

let threadXML = ""; // Simple in-memory store. Replace with DB or file store as needed.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, systemMessage, stream } = body;

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

    // Check if streaming is requested
    if (stream) {
      // Return streaming response
      const llmStream = await getLLMResponseStream(threadXML + "\n\n Response:", systemMessage);
      
      let fullResponse = '';
      
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Send initial data with memory
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'memory', 
              memory: threadXML 
            })}\n\n`));
            
            // Process streaming response
            for await (const chunk of llmStream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'content', 
                  content: content 
                })}\n\n`));
              }
            }
            
            // Add final response to memory
            threadXML = await addEvent(threadXML, 'llm_response', fullResponse);
            
            // Send completion message
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'complete', 
              memory: threadXML 
            })}\n\n`));
            
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: 'Streaming failed' 
            })}\n\n`));
            controller.close();
          }
        },
      });
      
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response (fallback)
      const llmResponse = await getLLMResponse(threadXML + "\n\n Response:", systemMessage);
      threadXML = await addEvent(threadXML, 'llm_response', llmResponse);

      return NextResponse.json({ 
        response: llmResponse, 
        memory: threadXML 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
