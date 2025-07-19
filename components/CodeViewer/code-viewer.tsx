"use client";

import { useChatContext } from "@/providers/ChatProvider";
import { formatXML } from "@/lib/utils";

function CodeViewer() {
	const { memory } = useChatContext();
	return memory && (
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
	);
}

export default CodeViewer;