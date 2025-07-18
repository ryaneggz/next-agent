import { forwardRef } from 'react';

interface ChatMessagesProps {
  log: string[];
  isLoading: boolean;
  memory: string;
}

const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  ({ log, isLoading, memory }, ref) => {
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
      <>
        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Messages */}
          <div ref={ref} className="h-96 overflow-y-auto p-6 bg-gray-50">
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
      </>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';

export default ChatMessages;