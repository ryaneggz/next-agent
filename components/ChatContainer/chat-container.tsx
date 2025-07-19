"use client";

import { useChatContext } from "@/providers/ChatProvider";
import { useEffect } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

export function ChatContainer() {
	const { 
		chatContainerRef, 
		inputRef, 
		setSystemMessage,
		systemMessage,
		isLoading,
		setMemory,
		setIsLoading,
		model,
		input,
		setInput,
		log,
		setLog,
		useInitModelEffect,
	} = useChatContext();

	// Scroll functions
  const scrollToShowLatestMessage = () => {
    if (chatContainerRef.current) {
      // Scroll to show the latest user message at the top
      const container = chatContainerRef.current;
      const lastChild = container.lastElementChild?.lastElementChild;
      if (lastChild) {
        lastChild.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    const userMessage = input;
    setLog((prev: string[]) => [...prev, `You: ${userMessage}`]);
    setInput('');

    // Scroll to show the latest user message at the top
    setTimeout(() => {
      scrollToShowLatestMessage();
    }, 100);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userMessage, systemMessage, model, stream: true }),
      });

      if (res.headers.get('content-type')?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let streamingResponse = '';
        
        // Add initial streaming message
        const streamingIndex = log.length + 1;
        setLog((prev: string[]) => [...prev, `Agent: `]);
        
        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'memory') {
                  setMemory(data.memory);
                } else if (data.type === 'content') {
                  streamingResponse += data.content;
                  setLog((prev: string[]) => {
                    const newLog = [...prev];
                    newLog[streamingIndex] = `Agent: ${streamingResponse}`;
                    return newLog;
                  });
                  // Auto-scroll to bottom during streaming
                  setTimeout(() => {
                    scrollToBottom();
                  }, 50);
                } else if (data.type === 'complete') {
                  setMemory(data.memory);
                } else if (data.type === 'error') {
                  setLog((prev: string[]) => [...prev.slice(0, -1), `Error: ${data.error}`]);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } else {
        // Handle regular JSON response (fallback)
        const data = await res.json();
        setLog((prev: string[]) => [...prev, `Agent: ${data.response}`]);
        
        // Update memory state with the XML response
        if (data.memory) {
          setMemory(data.memory);
        }
      }
    } catch (error) {
      console.error('Request error:', error);
      setLog((prev: string[]) => [...prev, `Error: Failed to get response`]);
    } finally {
      setIsLoading(false);
    } 
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

	// Load system message from localStorage on component mount
  useEffect(() => {
    const savedSystemMessage = localStorage.getItem('systemMessage');
    if (savedSystemMessage) {
      setSystemMessage(savedSystemMessage);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save system message to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('systemMessage', systemMessage);
  }, [systemMessage]);

	useInitModelEffect();
	useEffect(() => {
		if (model) {
			localStorage.setItem('model', model.toString());
		}
	}, [model]);

  // Focus input on page load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus input after AI response completes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
			{/* Chat Messages */}
			<div ref={chatContainerRef} className="h-96 overflow-y-auto p-6 bg-gray-50">
				{log.length === 0 ? (
					<div className="text-center text-gray-500 mt-20">
						<div className="text-6xl mb-4">🤖</div>
						<p className="text-lg">Start a conversation with your AI agent!</p>
					</div>
				) : (
					<div className="space-y-4">
						{log.map((line: string, i: number) => {
							const isUser = line.startsWith('You:');
							const isError = line.startsWith('Error:');
							const content = line.substring(line.indexOf(':') + 1).trim();
							
							return (
								<div
									key={i}
									className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
								>
									<div
										className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
											isUser
												? 'bg-blue-500 text-white rounded-br-md'
												: isError
												? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-md'
												: 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
										}`}
									>
										{!isUser && (
											<div className="flex items-center mb-1">
												<span className="text-xs font-medium text-gray-500">
													{isError ? '⚠️ Error' : '🤖 Agent'}
												</span>
											</div>
										)}
										<div className="text-sm leading-relaxed">
											{isUser || isError ? (
												<div className="whitespace-pre-wrap">{content}</div>
											) : (
												<MarkdownRenderer content={content} />
											)}
										</div>
									</div>
								</div>
							);
						})}
						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-2">
									<div className="flex items-center space-x-1">
										<span className="text-xs font-medium text-gray-500 mb-1 block">🤖 Agent</span>
										<div className="flex space-x-1">
											<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
											<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
											<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Input Area */}
			<div className="p-4 bg-white border-t border-gray-200">
				<div className="flex space-x-2">
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={e => setInput(e.target.value)}
						onKeyDown={handleKeyPress}
						placeholder="Type your message..."
						disabled={isLoading}
						className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
					/>
					<button
						onClick={handleSubmit}
						disabled={isLoading || !input.trim()}
						className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
					>
						{isLoading ? (
							<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
						) : (
							'Send'
						)}
					</button>
				</div>
				<p className="text-xs text-gray-500 mt-2 text-center">
					Press Enter to send • Shift+Enter for new line
				</p>
			</div>
		</div>
	);
}

export default ChatContainer;