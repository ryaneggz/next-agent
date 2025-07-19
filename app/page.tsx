import ChatContainer from '@/components/ChatContainer';
import CodeViewer from '@/components/CodeViewer';
import ModelSelector from '@/components/ModelSelector/model-selector';
import SettingButton from '@/components/SettingButton';
import SystemMessageEditor from '@/components/SystemMessageEditor';

export default function Home() {

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
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Weather</span>
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Web Search</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Stock Info</span>
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Math</span>
            </div>
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
