import ChatContainer from '@/components/ChatContainer';
import CodeViewer from '@/components/CodeViewer';
import ModelSelector from '@/components/ModelSelector/model-selector';
import SettingButton from '@/components/SettingButton';
import SystemMessageEditor from '@/components/SystemMessageEditor';
import { getToolDescription } from '@/lib/tools';

'use client';

import { useState } from 'react';

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const toolConfigs = [
    { key: 'get_weather', label: 'Weather', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { key: 'web_search', label: 'Web Search', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { key: 'get_stock_info', label: 'Stock Info', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { key: 'math_calculator', label: 'Math', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Simple AF Agent</h1>
          <p className="text-gray-600">Interact with your intelligent assistant</p>

          <ModelSelector />
          
          {/* Available Tools Description */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Available Tools:</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              {toolConfigs.map((tool) => {
                const description = getToolDescription(tool.key);
                return (
                  <div key={tool.key} className="relative">
                    <button
                      className={`${tool.color} px-2 py-1 rounded-full transition-colors cursor-pointer`}
                      onClick={() => setSelectedTool(selectedTool === tool.key ? null : tool.key)}
                      title={description?.shortDescription || tool.label}
                    >
                      {tool.label}
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Tool Description Popup */}
            {selectedTool && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-lg border max-w-md mx-auto text-left">
                {(() => {
                  const description = getToolDescription(selectedTool);
                  if (!description) return null;
                  
                  return (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">{description.name}</h3>
                        <button
                          onClick={() => setSelectedTool(null)}
                          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                        >
                          ×
                        </button>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{description.detailedDescription}</p>
                      
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Parameters:</h4>
                        <p className="text-xs text-gray-600">{description.parameters}</p>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Examples:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {description.examples.map((example, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-gray-400 mr-1">•</span>
                              <span>"{example}"</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Expected Results:</h4>
                        <p className="text-xs text-gray-600">{description.expectedResults}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          {/* System Message Editor Icon */}
          <SettingButton />
        </div>


        {/* System Message Editor */}
        <SystemMessageEditor />

        {/* Chat Container */}
        <ChatContainer />

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Powered by Next.js x <a href="https://github.com/enso-labs" target="_blank" rel="noopener noreferrer">Enso Labs</a> x <a href="https://js.langchain.com/docs/how_to/chat_models_universal_init/" target="_blank" rel="noopener noreferrer">Langchain 🦜🔗</a>
        </div>

        {/* XML Memory Display */}
        <CodeViewer />
      </div>
    </main>
  );
}


