import { NextRequest, NextResponse } from 'next/server';
import { getLLMResponse, getLLMResponseStream, agentLoop } from '@/lib/classify';
import { agentMemory, ThreadState, convertStateToXML, getSystemMessage } from '@/lib/memory';

let state: ThreadState = {
  thread: {
    systemMessage: 'You are a helpful AI assistant.',
    events: [],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  }
}; // Simple in-memory store. Replace with DB or file store as needed.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, model, stream, state: clientState } = body;

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    // Use client state if provided, otherwise use server state
    if (clientState) {
      state = clientState;
    }

    // Get system message from thread state
    const systemMessage = getSystemMessage(state);

    // Add user input as an event
    state = await agentMemory('user_input', input, state);
    state = await agentLoop(input, state, model);
    const prompt = convertStateToXML(state) + "\n\nResponse:";
    
    // Check if streaming is requested
    if (stream) {
      // Return streaming response
      const llmStream = await getLLMResponseStream(prompt, systemMessage, model);
      
      let fullResponse = '';
      
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // Send initial data with memory (convert to XML for compatibility)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'memory', 
              state 
            })}\n\n`));
            
            // Process streaming response
            for await (const chunk of llmStream) {
              const content = chunk.content || '';
              state.thread.usage = chunk.response_metadata?.usage;
              if (content) {
                fullResponse += content;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                  type: 'content', 
                  content: content 
                })}\n\n`));
              }
            }
            
            // Add final response to memory
            state = await agentMemory('llm_response', fullResponse, state);
            
            // Send completion message (convert to XML for compatibility)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'complete', 
              state
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
      const prompt = convertStateToXML(state) + "\n\nResponse:";
      const llmResponse = await getLLMResponse(prompt, systemMessage, model);
      state = await agentMemory('llm_response', llmResponse, state);

      return NextResponse.json({ 
        response: llmResponse, 
        state: state
      });
    }
  } catch (error: unknown) {
    console.error('API Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('400')) {
        const errorMessage = error.message.split('400 ')[1];
        const errorObject = JSON.parse(errorMessage);
        return NextResponse.json({ 
          error: {
            message: `(${errorObject.error.type}) ${errorObject.error.message}`,
            type: errorObject.error.type
          }
        }, { status: 400 });
      } else {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
