
import ChatModels from "@/lib/types/llm";
import { useEffect, useRef, useState} from "react";

export default function useChat() {
	const inputRef = useRef<HTMLInputElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	
	const [log, setLog] = useState<string[]>([]);
	const [input, setInput] = useState<string>('');
	const [systemMessage, setSystemMessage] = useState('You are a helpful AI assistant.');
	const [model, setModel] = useState<ChatModels>('');
  const [memory, setMemory] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSystemEditorOpen, setIsSystemEditorOpen] = useState(false);

	const useInitModelEffect = () => {
		useEffect(() => {
			if (typeof window !== "undefined") {
				const savedModel = localStorage.getItem('model');
				if (savedModel) {
					setModel(savedModel as ChatModels);
				}
			}
		}, []);
	}
  
	return {
		chatContainerRef,
		inputRef,
		isLoading,
		memory,
		systemMessage,
		setSystemMessage,
		isSystemEditorOpen,
		setIsSystemEditorOpen,
		setMemory,
		setInput,
		setIsLoading,
		input,
		model,
		setModel,
		log,
		setLog,
		useInitModelEffect,
	}
}