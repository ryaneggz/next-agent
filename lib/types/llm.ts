export class ChatModels {
	public static readonly OPENAI_GPT_4_1_MINI = "openai:gpt-4.1-mini";
	public static readonly OPENAI_GPT_4O = "openai:gpt-4o";
	public static readonly OPENAI_O3 = "openai:o3";
	public static readonly OPENAI_O4_MINI = "openai:o4-mini";
	public static readonly ANTHROPIC_CLAUDE_4_SONNET = "anthropic:claude-sonnet-4-20250514";
	public static readonly ANTHROPIC_CLAUDE_4_OPUS = "anthropic:claude-opus-4-20250514";
	public static readonly XAI_GROK_4 = "xai:grok-4-latest";
	public static readonly GOOGLE_GEMINI_2_5_FLASH = "google:gemini-2.5-flash-latest";
	// public static readonly GROQ_DEEPSEEK_R1_DISTILL_LLAMA_70B = "groq:deepseek-r1-distill-llama-70b"; # Issues parsing route.ts (21:24)
	public static readonly GROQ_LLAMA_3_3_70B_VERSATILE = "groq:llama-3.3-70b-versatile";
	public static readonly OLLAMA_LLAMA_3_2_VISION = "ollama:llama3.2-vision";
	public static readonly OLLAMA_DEEPSEEK_R1_8B = "ollama:deepseek-r1:8b";
	public static readonly OLLAMA_DEEPSEEK_R1_14B = "ollama:deepseek-r1:14b";
}

export default ChatModels;