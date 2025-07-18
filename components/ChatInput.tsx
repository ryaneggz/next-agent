import { useState, useEffect, useRef } from 'react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  systemMessage: string;
  onLog: (message: string) => void;
  onMemoryUpdate: (memory: string) => void;
  onScrollToLatest: () => void;
  onScrollToBottom: () => void;
}

const ChatInput = ({ 
  onSubmit, 
  isLoading, 
  systemMessage, 
  onLog, 
  onMemoryUpdate, 
  onScrollToLatest,
  onScrollToBottom 
}: ChatInputProps) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    onLog(`You: ${userMessage}`);
    
    // Scroll to show the latest user message at the top
    setTimeout(() => {
      onScrollToLatest();
    }, 100);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userMessage, systemMessage, stream: true }),
      });

      if (res.headers.get('content-type')?.includes('text/event-stream')) {
        // Handle streaming response
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let streamingResponse = '';
        
        // Add initial streaming message
        onLog(`Agent: `);
        
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
                  onMemoryUpdate(data.memory);
                } else if (data.type === 'content') {
                  streamingResponse += data.content;
                  onLog(`Agent: ${streamingResponse}`);
                  // Auto-scroll to bottom during streaming
                  setTimeout(() => {
                    onScrollToBottom();
                  }, 50);
                } else if (data.type === 'complete') {
                  onMemoryUpdate(data.memory);
                } else if (data.type === 'error') {
                  onLog(`Error: ${data.error}`);
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
        onLog(`Agent: ${data.response}`);
        
        // Update memory state with the XML response
        if (data.memory) {
          onMemoryUpdate(data.memory);
        }
      }
    } catch (error) {
      console.error('Request error:', error);
      onLog(`Error: Failed to get response`);
    } finally {
      // Focus input after response completes
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
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
  );
};

export default ChatInput;