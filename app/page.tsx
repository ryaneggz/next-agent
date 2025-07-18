"use client";

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [memory, setMemory] = useState<string>('');
  const [systemMessage, setSystemMessage] = useState('You are a helpful AI assistant.');
  const [isSystemEditorOpen, setIsSystemEditorOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load system message from localStorage on component mount
  useEffect(() => {
    const savedSystemMessage = localStorage.getItem('systemMessage');
    if (savedSystemMessage) {
      setSystemMessage(savedSystemMessage);
    }
  }, []);

  // Save system message to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('systemMessage', systemMessage);
  }, [systemMessage]);

  // Focus input on page load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Focus input after AI response completes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

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
    setLog(prev => [...prev, `You: ${userMessage}`]);
    setInput('');

    // Scroll to show the latest user message at the top
    setTimeout(() => {
      scrollToShowLatestMessage();
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
        const streamingIndex = log.length + 1;
        setLog(prev => [...prev, `Agent: `]);
        
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
                  setLog(prev => {
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
                  setLog(prev => [...prev.slice(0, -1), `Error: ${data.error}`]);
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
        setLog(prev => [...prev, `Agent: ${data.response}`]);
        
        // Update memory state with the XML response
        if (data.memory) {
          setMemory(data.memory);
        }
      }
    } catch (error) {
      console.error('Request error:', error);
      setLog(prev => [...prev, `Error: Failed to get response`]);
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

  const formatXML = (xmlString: string) => {
    if (!xmlString) return '';
    
    // Simple XML formatting for display
    return xmlString
      .replace(/></g, '>\n<')
      .replace(/^\s*\n/gm, '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Simple AF Agent</h1>
          <p className="text-gray-600">Interact with your intelligent assistant</p>
          
          {/* System Message Editor Icon */}
          <button
            onClick={() => setIsSystemEditorOpen(!isSystemEditorOpen)}
            className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit system message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* System Message Editor */}
        {isSystemEditorOpen && (
          <div className="mb-6 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">System Message</h3>
              <button
                onClick={() => setIsSystemEditorOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <textarea
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              placeholder="Enter your system message here..."
              className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              This message will be sent to the AI as context for how it should behave.
            </p>
          </div>
        )}

        {/* Chat Container */}
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
                {log.map((line, i) => {
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
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
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

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Powered by Next.js & AI
        </div>

        {/* XML Memory Display */}
        {memory && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-3">
              <h3 className="text-lg font-semibold flex items-center">
                <span className="mr-2">🧠</span>
                Context Window (XML) | Factor 03
              </h3>
            </div>
            <div className="p-6">
              <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm text-gray-800 border">
                <code>{formatXML(memory)}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
