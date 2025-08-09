import { NextRequest, NextResponse } from 'next/server';
import { agentLoop } from '@enso-labs/agent-core';
import { ThreadState, getSystemMessage } from '@/lib/memory';
import { AGENT_TOOLS } from '@/lib/tools';
import { Tool } from 'langchain/tools';

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
    const response = await agentLoop({
      prompt: input,
      model: model,
      systemMessage: getSystemMessage(state),
      stream: stream,
      tools: AGENT_TOOLS as unknown as Tool<any>[]
    });

    if (stream) {
      return new Response(response as ReadableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      return NextResponse.json({ 
        response: response, 
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
