import { NextRequest, NextResponse } from 'next/server';
import { getLLMResponse, getLLMResponseStream, handleToolCall } from '@/lib/classify';
import { addEvent } from '@/lib/memory';

let threadXML = ""; // Simple in-memory store. Replace with DB or file store as needed.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, systemMessage, model, stream } = body;

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    // Add user input as an event
    threadXML = await addEvent(threadXML, 'user_input', input);
    threadXML = await handleToolCall(input, model, threadXML);

    // Check if streaming is requested
    if (stream) {
      // Return streaming response
      const llmStream = await getLLMResponseStream(threadXML + "\n\n Response:", systemMessage, model);
      
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
              const content = chunk.content || '';
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
      const llmResponse = await getLLMResponse(threadXML + "\n\n Response:", systemMessage, model);
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
