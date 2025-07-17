import { NextRequest, NextResponse } from 'next/server';
import { classifyIntent } from '@/lib/classify';
import { tools } from '@/lib/tools';
import { updateMemory } from '@/lib/memory';

let threadXML = ""; // Simple in-memory store. Replace with DB or file store as needed.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    threadXML = await updateMemory(threadXML, 'user', input);

    const { tool, args } = await classifyIntent(input);

    let output: string;
    if (tool in tools) {
      // TypeScript-safe access
      output = tools[tool as keyof typeof tools](args);
    } else {
      output = `Unknown tool: ${tool}`;
    }

    threadXML = await updateMemory(threadXML, 'assistant', output);

    return NextResponse.json({ 
      response: output, 
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
