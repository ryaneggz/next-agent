"use client";

import { useChatContext } from "@/providers/ChatProvider";

export function SystemMessageEditor() {
	const { 
		isSystemEditorOpen, 
		setIsSystemEditorOpen, 
		systemMessage, 
		setSystemMessage, 
	} = useChatContext();

	return isSystemEditorOpen && (
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
	)
}

export default SystemMessageEditor;