"use client";

import { useState, useEffect, useRef } from 'react';
import ChatMessages from '@/components/ChatMessages';
import SystemMessageEditor from '@/components/SystemMessageEditor';
import ChatInput from '@/components/ChatInput';

export default function Home() {
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [memory, setMemory] = useState<string>('');
  const [systemMessage, setSystemMessage] = useState('You are a helpful AI assistant.');
  const [isSystemEditorOpen, setIsSystemEditorOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Chat input handlers
  const handleSubmit = (_message: string) => {
    setIsLoading(true);
  };

  const handleLog = (message: string) => {
    setLog(prev => {
      const newLog = [...prev];
      // Handle streaming updates by updating the last agent message
      if (message.startsWith('Agent: ') && prev.length > 0 && prev[prev.length - 1].startsWith('Agent: ')) {
        newLog[newLog.length - 1] = message;
      } else {
        newLog.push(message);
      }
      return newLog;
    });
  };

  const handleMemoryUpdate = (newMemory: string) => {
    setMemory(newMemory);
    setIsLoading(false);
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
        <SystemMessageEditor
          isOpen={isSystemEditorOpen}
          onClose={() => setIsSystemEditorOpen(false)}
          systemMessage={systemMessage}
          onSystemMessageChange={setSystemMessage}
        />

        {/* Chat Messages */}
        <ChatMessages
          ref={chatContainerRef}
          log={log}
          isLoading={isLoading}
          memory={memory}
        />

        {/* Chat Input */}
        <ChatInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          systemMessage={systemMessage}
          onLog={handleLog}
          onMemoryUpdate={handleMemoryUpdate}
          onScrollToLatest={scrollToShowLatestMessage}
          onScrollToBottom={scrollToBottom}
        />

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Powered by Next.js & AI
        </div>
      </div>
    </main>
  );
}