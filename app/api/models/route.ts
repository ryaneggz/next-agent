import { NextRequest, NextResponse } from 'next/server';
import { ChatModels } from '@/lib/types/llm';
import Config from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Get all static properties from ChatModels class
    const allModels = Object.getOwnPropertyNames(ChatModels)
      .filter(name => name !== 'length' && name !== 'name' && name !== 'prototype')
      .map(name => (ChatModels as any)[name])
      .filter(value => typeof value === 'string')
      .sort();

    // Filter models based on available API keys
    const availableModels = allModels.filter(model => {
      if (model.startsWith('anthropic:')) {
        return !!Config.ANTHROPIC_API_KEY;
      }
      if (model.startsWith('google-vertexai:')) {
        return !!(Config.GOOGLE_API_KEY || Config.GOOGLE_APPLICATION_CREDENTIALS);
      }
      if (model.startsWith('groq:')) {
        return !!Config.GROQ_API_KEY;
      }
      if (model.startsWith('ollama:')) {
        return !!Config.OLLAMA_BASE_URL;
      }
      if (model.startsWith('openai:')) {
        return !!Config.OPENAI_API_KEY;
      }
      if (model.startsWith('xai:')) {
        return !!Config.XAI_API_KEY;
      }
      // Default to false if model prefix doesn't match any known provider
      return false;
    });

    return NextResponse.json({
      models: availableModels,
      count: availableModels.length
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
} 