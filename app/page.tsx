"use client";

import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    const userMessage = input;
    setLog(prev => [...prev, `You: ${userMessage}`]);
    setInput('');

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userMessage }),
      });
      const data = await res.json();
      setLog(prev => [...prev, `Agent: ${data.response}`]);
    } catch (error) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Agent Chat</h1>
          <p className="text-gray-600">Interact with your intelligent assistant</p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 bg-gray-50">
            {log.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <div className="text-6xl mb-4">🤖</div>
                <p className="text-lg">Start a conversation with your AI agent!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {log.map((line, i) => {
                  const isUser = line.startsWith('You:');
                  const isAgent = line.startsWith('Agent:');
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
                        <p className="text-sm leading-relaxed">{content}</p>
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
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
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
      </div>
    </main>
  );
}
