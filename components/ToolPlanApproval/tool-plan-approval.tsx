"use client";

import { useState } from 'react';

// Tool intent types (matching classify.ts)
interface WeatherIntent {
  intent: 'get_weather';
  args: { location: string };
}

interface StockIntent {
  intent: 'get_stock_info';
  args: { ticker: string };
}

interface WebSearchIntent {
  intent: 'web_search';
  args: { query: string };
}

interface MathIntent {
  intent: 'math_calculator';
  args: { expression: string };
}

type ToolIntent = WeatherIntent | StockIntent | WebSearchIntent | MathIntent;

interface ToolPlanApprovalProps {
  toolIntents: ToolIntent[];
  onApprove: (approvedTools: ToolIntent[]) => void;
  onReject: () => void;
}

// Tool descriptions and icons
const getToolInfo = (intent: ToolIntent) => {
  switch (intent.intent) {
    case 'get_weather':
      return {
        name: 'Weather Information',
        icon: '🌤️',
        description: `Get current weather information for ${intent.args.location}`,
        details: `This will fetch real-time weather data including temperature, conditions, and forecast for the specified location.`,
        color: 'bg-blue-50 border-blue-200 text-blue-800'
      };
    case 'get_stock_info':
      return {
        name: 'Stock Information',
        icon: '📈',
        description: `Get stock price and market data for ${intent.args.ticker.toUpperCase()}`,
        details: `This will retrieve current stock price, daily change, volume, market cap, and other financial metrics for the ticker symbol.`,
        color: 'bg-green-50 border-green-200 text-green-800'
      };
    case 'web_search':
      return {
        name: 'Web Search',
        icon: '🔍',
        description: `Search the web for "${intent.args.query}"`,
        details: `This will perform a comprehensive web search and return relevant results, articles, and information from across the internet.`,
        color: 'bg-purple-50 border-purple-200 text-purple-800'
      };
    case 'math_calculator':
      return {
        name: 'Math Calculator',
        icon: '🧮',
        description: `Calculate: ${intent.args.expression}`,
        details: `This will evaluate the mathematical expression and return the calculated result with proper order of operations.`,
        color: 'bg-orange-50 border-orange-200 text-orange-800'
      };
    default:
      return {
        name: 'Unknown Tool',
        icon: '❓',
        description: 'Unknown tool execution',
        details: 'This tool execution is not recognized.',
        color: 'bg-gray-50 border-gray-200 text-gray-800'
      };
  }
};

export default function ToolPlanApproval({ toolIntents, onApprove, onReject }: ToolPlanApprovalProps) {
  const [selectedTools, setSelectedTools] = useState<Set<number>>(new Set(toolIntents.map((_, index) => index)));

  const toggleTool = (index: number) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTools(newSelected);
  };

  const selectAll = () => {
    setSelectedTools(new Set(toolIntents.map((_, index) => index)));
  };

  const selectNone = () => {
    setSelectedTools(new Set());
  };

  const handleApprove = () => {
    const approvedTools = toolIntents.filter((_, index) => selectedTools.has(index));
    onApprove(approvedTools);
  };

  const handleReject = () => {
    onReject();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            🛠️ Tool Execution Plan
          </h3>
          <p className="text-sm text-gray-600">
            Review and approve the tools that will be executed for your request
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={selectNone}
            className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            Select None
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {toolIntents.map((intent, index) => {
          const toolInfo = getToolInfo(intent);
          const isSelected = selectedTools.has(index);

          return (
            <div
              key={index}
              className={`border rounded-lg p-3 transition-all cursor-pointer ${
                isSelected 
                  ? `${toolInfo.color} border-2` 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => toggleTool(index)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTool(index)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{toolInfo.icon}</span>
                    <h4 className="font-medium text-gray-800">{toolInfo.name}</h4>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {toolInfo.description}
                  </p>
                  <p className="text-xs text-gray-600">
                    {toolInfo.details}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {selectedTools.size} of {toolIntents.length} tools selected
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={selectedTools.size === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Execute Selected Tools ({selectedTools.size})
          </button>
        </div>
      </div>
    </div>
  );
}
