export interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
  type: "function";
}

export interface AgentConfig {
  maxTurns?: number;
  temperature?: number;
  model?: string;
  [key: string]: unknown;
}

export interface AgentResponse {
  content: string;
  tool_calls?: ToolCall[];
  turns_used: number;
  success: boolean;
}

export interface LLMFunction {
  (messages: Message[]): Promise<{
    content: string;
    tool_calls?: ToolCall[];
  }>;
}

export interface ToolFunction {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (args: unknown) => Promise<string>;
}

export interface AgentRequest {
  system_prompt: string;
  user_input: string;
  config?: AgentConfig;
} 