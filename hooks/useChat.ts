
import { ThreadState, updateSystemMessage, getSystemMessage } from "@/lib/memory";
import ChatModels from "@/lib/types/llm";
import { useEffect, useRef, useState} from "react";

export default function useChat() {
	const inputRef = useRef<HTMLInputElement>(null);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	
	const [log, setLog] = useState<string[]>([]);
	const [input, setInput] = useState<string>('');
	const [model, setModel] = useState<ChatModels>('');
  const [state, setState] = useState<ThreadState>({
    thread: {
      systemMessage: 'You are a helpful AI assistant.',
      events: []
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSystemEditorOpen, setIsSystemEditorOpen] = useState(false);

  // System message helpers
  const systemMessage = getSystemMessage(state);
  const setSystemMessage = (message: string) => {
    setState(currentState => updateSystemMessage(currentState, message));
  };

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
		state,
		systemMessage,
		setSystemMessage,
		isSystemEditorOpen,
		setIsSystemEditorOpen,
		setState,
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