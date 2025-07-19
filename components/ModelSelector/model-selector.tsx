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
				<option value={ChatModels.GOOGLE_GEMINI_2_0_FLASH_LITE}>Google | Gemini 2.0 Flash Lite</option>
				<option value={ChatModels.GOOGLE_GEMINI_2_0_FLASH}>Google | Gemini 2.0 Flash</option>
				{/* <option value={ChatModels.GOOGLE_GEMINI_2_0_PRO}>Google | Gemini 2.0 Pro</option> */}
				<option value={ChatModels.GOOGLE_GEMINI_2_5_FLASH_LITE}>Google | Gemini 2.5 Flash Lite</option>
				<option value={ChatModels.GOOGLE_GEMINI_2_5_FLASH}>Google | Gemini 2.5 Flash</option>
				<option value={ChatModels.GOOGLE_GEMINI_2_5_PRO}>Google | Gemini 2.5 Pro</option>
				<option value={ChatModels.GROQ_LLAMA_3_3_70B_VERSATILE}>Groq | Llama 3.3 70B Versatile</option>
				<option value={ChatModels.OPENAI_GPT_4o}>OpenAI | GPT-4o</option>
				<option value={ChatModels.OPENAI_GPT_4_1_NANO}>OpenAI | GPT-4.1 Nano</option>
				<option value={ChatModels.OPENAI_GPT_4_1_MINI}>OpenAI | GPT-4.1 Mini</option>
				<option value={ChatModels.OPENAI_GPT_4_5}>OpenAI | GPT-4.5</option>
				<option value={ChatModels.OPENAI_O3}>OpenAI | o3</option>
				<option value={ChatModels.OPENAI_O4_MINI}>OpenAI | o4 Mini</option>
				<option value={ChatModels.XAI_GROK_3_MINI_FAST}>XAI | Grok 3 Mini Fast</option>
				<option value={ChatModels.XAI_GROK_3_MINI}>XAI | Grok 3 Mini</option>
				<option value={ChatModels.XAI_GROK_3_FAST}>XAI | Grok 3 Fast</option>
				<option value={ChatModels.XAI_GROK_3}>XAI | Grok 3</option>
				<option value={ChatModels.XAI_GROK_4}>XAI | Grok 4</option>
			</select>
		</div>
	);
}

export default ModelSelector;