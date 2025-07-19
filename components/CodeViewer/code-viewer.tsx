"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/providers/ChatProvider";
import { formatXML } from "@/lib/utils";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/github.css";
import { convertStateToXML } from "@/lib/memory";
import MarkdownRenderer from "@/components/MarkdownRenderer";

// Register languages
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);

type ViewMode = 'md' | 'xml' | 'json';

function CodeViewer() {
	const { state, useTotalTokensEffect, totalTokens } = useChatContext();
	const codeRef = useRef<HTMLElement>(null);
	const [viewMode, setViewMode] = useState<ViewMode>('md');

	useEffect(() => {
		if (codeRef.current && (viewMode === 'xml' || viewMode === 'json')) {
			hljs.highlightElement(codeRef.current);
		}
	}, [state, viewMode]);

	useTotalTokensEffect();

	const renderContent = () => {
		switch (viewMode) {
			case 'md':
				return (
					<div className="bg-gray-50 rounded-lg border max-h-[250px] overflow-y-auto">
						{state.thread.events.length > 0 ? (
							<div className="p-4 prose prose-sm max-w-none">
								{state.thread.events.map((event: any, index: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
									<div key={index} className="mb-4">
										{event.intent === 'user_input' && (
											<div className="mb-2">
												<strong className="text-blue-600">👤 User:</strong>
												<div className="mt-1">
													<MarkdownRenderer content={event.content} className="text-gray-800" />
												</div>
											</div>
										)}
										{event.intent === 'llm_response' && (
											<div className="mb-2">
												<strong className="text-green-600">🤖 Assistant:</strong>
												<div className="mt-1">
													<MarkdownRenderer content={event.content} className="text-gray-800" />
												</div>
											</div>
										)}
										{event.intent !== 'user_input' && event.intent !== 'llm_response' && (
											<div className="mb-2">
												<strong className="text-purple-600">🔧 Tool ({event.intent}):</strong>
												<div className="mt-1">
													<MarkdownRenderer content={event.content} className="text-gray-800" />
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						) : (
							<div className="p-4 text-gray-500 text-center">
								No events found in memory
							</div>
						)}
					</div>
				);
			case 'xml':
				return (
					<pre className="bg-gray-50 rounded-lg p-0 overflow-x-auto text-sm text-gray-800 border max-h-[250px] overflow-y-auto">
						<code ref={codeRef} className="language-xml block p-4">{formatXML(convertStateToXML(state))}</code>
					</pre>
				);
			case 'json':
				return (
					<pre className="bg-gray-50 rounded-lg p-0 overflow-x-auto text-sm text-gray-800 border max-h-[250px] overflow-y-auto">
						<code ref={codeRef} className="language-json block p-4">{JSON.stringify(state, null, 2)}</code>
					</pre>
				);
			default:
				return null;
		}
	};

	return state.thread.events.length > 0 && (
		<div className="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden">
			<div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
				<h3 className="text-lg font-semibold flex items-center">
					<span className="mr-2">🧠</span>
					Context Window | Factor 03
					<span className="ml-4 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{totalTokens} tokens
					</span>
				</h3>
				<div className="flex items-center space-x-2">
					<select
						value={viewMode}
						onChange={(e) => setViewMode(e.target.value as ViewMode)}
						className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value="md">Markdown</option>
						<option value="xml">XML</option>
						<option value="json">JSON</option>
					</select>
				</div>
			</div>
			<div className="p-6">
				{renderContent()}
			</div>
		</div>
	);
}

export default CodeViewer;