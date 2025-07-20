"use client";

import ChatModels from "@/lib/types/llm";
import { useChatContext } from "@/providers/ChatProvider";
import { useState, useEffect } from "react";

export function ModelSelector() {
	const { model, setModel } = useChatContext();
	const [models, setModels] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchModels = async () => {
			try {
				const response = await fetch('/api/models');
				const data = await response.json();
				setModels(data.models || []);
			} catch (error) {
				console.error('Failed to fetch models:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchModels();
	}, []);

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
				disabled={loading}
			>
				{loading ? (
					<option>Loading models...</option>
				) : (
					models.map((modelValue) => (
						<option key={modelValue} value={modelValue}>
							{modelValue}
						</option>
					))
				)}
			</select>
		</div>
	);
}

export default ModelSelector;