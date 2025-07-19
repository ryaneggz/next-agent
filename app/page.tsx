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
          
          {/* System Message Editor Icon */}
          <SettingButton />
        </div>


        {/* System Message Editor */}
        <SystemMessageEditor />

        {/* Chat Container */}
        <ChatContainer />

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          Powered by Next.js & AI
        </div>

        {/* XML Memory Display */}
        <CodeViewer />
      </div>
    </main>
  );
}
