import { useContext, createContext } from "react";
import useChat from "@/hooks/useChat";

export const ChatContext = createContext({});

export default function ChatProvider({ children }: { children: React.ReactNode }) {
	const chatHooks = useChat();
	
	return (    
		<ChatContext.Provider value={{
			...chatHooks,
		}}>
				{children}
		</ChatContext.Provider>
	);
}

export function useChatContext(): any {
    return useContext(ChatContext);
}	