"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/providers/ChatProvider";
import { formatXML } from "@/lib/utils";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import json from "highlight.js/lib/languages/json";
import "highlight.js/styles/github.css";
import { convertStateToXML } from "@/lib/memory";

// Register languages
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);

type ViewMode = 'md' | 'xml' | 'json';

function CodeViewer() {
	const { state } = useChatContext();
	const codeRef = useRef<HTMLElement>(null);
	const [viewMode, setViewMode] = useState<ViewMode>('md');

	// Function to convert URLs and markdown links to clickable links
	const makeLinksClickable = (text: string): React.JSX.Element => {
		if (!text) return <span>{text}</span>;

		// URL regex pattern
		const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
		// Markdown link regex pattern
		const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/gi;

		const elements: React.JSX.Element[] = [];
		let lastIndex = 0;

		// First, handle markdown links
		let markdownMatch: RegExpExecArray | null;
		const markdownMatches: { match: string; text: string; url: string; index: number }[] = [];
		
		while ((markdownMatch = markdownLinkRegex.exec(text)) !== null) {
			markdownMatches.push({
				match: markdownMatch[0],
				text: markdownMatch[1],
				url: markdownMatch[2],
				index: markdownMatch.index
			});
		}

		// Then handle plain URLs (excluding those already in markdown links)
		let urlMatch: RegExpExecArray | null;
		const urlMatches: { match: string; url: string; index: number }[] = [];
		
		while ((urlMatch = urlRegex.exec(text)) !== null) {
			// Check if this URL is part of a markdown link
			const isInMarkdown = markdownMatches.some(md => 
				urlMatch!.index >= md.index && urlMatch!.index < md.index + md.match.length
			);
			
			if (!isInMarkdown) {
				urlMatches.push({
					match: urlMatch[0],
					url: urlMatch[0],
					index: urlMatch.index
				});
			}
		}

		// Combine and sort all matches by index
		const allMatches = [
			...markdownMatches.map(m => ({ ...m, type: 'md' as const })),
			...urlMatches.map(m => ({ ...m, type: 'url' as const, text: m.url }))
		].sort((a, b) => a.index - b.index);

		// Build JSX elements
		allMatches.forEach((match, index) => {
			// Add text before this match
			if (match.index > lastIndex) {
				const beforeText = text.slice(lastIndex, match.index);
				if (beforeText) {
					elements.push(<span key={`text-${index}`}>{beforeText}</span>);
				}
			}

			// Add the link
			elements.push(
				<a
					key={`link-${index}`}
					href={match.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-600 hover:text-blue-800 underline"
				>
					{match.text}
				</a>
			);

			lastIndex = match.index + match.match.length;
		});

		// Add remaining text
		if (lastIndex < text.length) {
			const remainingText = text.slice(lastIndex);
			if (remainingText) {
				elements.push(<span key="text-end">{remainingText}</span>);
			}
		}

		// If no matches found, return original text
		if (elements.length === 0) {
			return <span>{text}</span>;
		}

		return <>{elements}</>;
	};



	useEffect(() => {
		if (codeRef.current && state && (viewMode === 'xml' || viewMode === 'json')) {
			// Apply syntax highlighting for XML and JSON views
			hljs.highlightElement(codeRef.current);
		}
	}, [state, viewMode]);

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
												<div className="mt-1 text-gray-800">{makeLinksClickable(event.content)}</div>
											</div>
										)}
										{event.intent === 'llm_response' && (
											<div className="mb-2">
												<strong className="text-green-600">🤖 Assistant:</strong>
												<div className="mt-1 text-gray-800">{makeLinksClickable(event.content)}</div>
											</div>
										)}
										{event.intent !== 'user_input' && event.intent !== 'llm_response' && (
											<div className="mb-2">
												<strong className="text-purple-600">🔧 Tool ({event.intent}):</strong>
												<div className="mt-1 text-gray-800">{makeLinksClickable(event.content)}</div>
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