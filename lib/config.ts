class Config {
	public static readonly ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
	public static readonly GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
	public static readonly GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
	public static readonly GROQ_API_KEY = process.env.GROQ_API_KEY;
	public static readonly OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL;
	public static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;
	public static readonly XAI_API_KEY = process.env.XAI_API_KEY;
}

export default Config;