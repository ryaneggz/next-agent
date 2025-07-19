"use client";

import ChatModels from "@/lib/types/llm";
import { useChatContext } from "@/providers/ChatProvider";

export function ModelSelector() {
	const { model, setModel } = useChatContext();

	return (
		<div className="flex justify-center items-center gap-2 mt-2">
			<label htmlFor="model-select" className="text-sm font-medium text-gray-700">
				Model:
			</label>
			<select
				id="model-select"
				value={model.toString()}
				onChange={(e) => setModel(e.target.value as ChatModels)}
				className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm"
			>
				<option value={ChatModels.ANTHROPIC_CLAUDE_4_SONNET}>Anthropic | Claude 4 Sonnet</option>
				<option value={ChatModels.ANTHROPIC_CLAUDE_4_OPUS}>Anthropic | Claude 4 Opus</option>
				{/* <option value={ChatModels.GOOGLE_GEMINI_2_5_FLASH}>Gemini 2.5 Flash</option> */}
				{/* <option value={ChatModels.GROQ_DEEPSEEK_R1_DISTILL_LLAMA_70B}>DeepSeek R1 Distill Llama 70B</option>
				<option value={ChatModels.GROQ_LLAMA_3_2_90B_VISION}>Llama 3.2 90B Vision</option> */}
				<option value={ChatModels.GROQ_LLAMA_3_3_70B_VERSATILE}>Groq | Llama 3.3 70B Versatile</option>
				{/* <option value={ChatModels.OLLAMA_LLAMA_3_2_VISION}>Llama 3.2 Vision</option>
				<option value={ChatModels.OLLAMA_DEEPSEEK_R1_8B}>DeepSeek R1 8B</option>
				<option value={ChatModels.OLLAMA_DEEPSEEK_R1_14B}>DeepSeek R1 14B</option> */}
				<option value={ChatModels.OPENAI_GPT_4_1_MINI}>OpenAI | GPT-4.1 Mini</option>
				<option value={ChatModels.OPENAI_GPT_4O}>OpenAI | GPT-4o</option>
				<option value={ChatModels.OPENAI_O3}>OpenAI | o3</option>
				<option value={ChatModels.OPENAI_O4_MINI}>OpenAI | o4 Mini</option>
				
			</select>
		</div>
	);
}

export default ModelSelector;