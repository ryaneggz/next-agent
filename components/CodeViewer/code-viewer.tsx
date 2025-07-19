"use client";

import React, { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/providers/ChatProvider";
import { formatXML } from "@/lib/utils";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import "highlight.js/styles/github.css";
import { convertStateToXML } from "@/lib/memory";

// Register the XML language
hljs.registerLanguage('xml', xml);

interface ParsedEvent {
	intent: string;
	content: string;
	attributes: Record<string, string>;
}

function CodeViewer() {
	const { state } = useChatContext();
	const codeRef = useRef<HTMLElement>(null);
	const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
	const [showInteractive, setShowInteractive] = useState(false);

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
			...markdownMatches.map(m => ({ ...m, type: 'markdown' as const })),
			...urlMatches.map(m => ({ ...m, type: 'url' as const, text: m.url }))
		].sort((a, b) => a.index - b.index);

		// Build the JSX with clickable links
		allMatches.forEach((match: { match: string; text: string; url: string; index: number; type: 'markdown' | 'url' }, i: number) => {
			// Add text before this match
			if (match.index > lastIndex) {
				elements.push(
					<span key={`text-${i}`}>
						{text.slice(lastIndex, match.index)}
					</span>
				);
			}

			// Add the clickable link
			elements.push(
				<a
					key={`link-${i}`}
					href={match.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-blue-600 hover:text-blue-800 underline bg-blue-50 px-1 rounded"
					onClick={(e) => e.stopPropagation()}
				>
					{match.text}
				</a>
			);

			lastIndex = match.index + match.match.length;
		});

		// Add remaining text
		if (lastIndex < text.length) {
			elements.push(
				<span key="text-end">
					{text.slice(lastIndex)}
				</span>
			);
		}

		return elements.length > 0 ? <>{elements}</> : <span>{text}</span>;
	};

	// Parse XML to extract events
	useEffect(() => {
		if (state.thread.events.length > 0) {
			try {
				const events: ParsedEvent[] = [];
				
				state.thread.events.forEach((event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
					const content = event.content;
					if (content && typeof content === 'string') {
						const intentMatch = content.match(/intent="([^"]*)"/);
						const typeMatch = content.match(/type="([^"]*)"/);
						const statusMatch = content.match(/status="([^"]*)"/);
						const doneMatch = content.match(/done="([^"]*)"/);
						const contentMatch = content.match(/>([^<]*)</);
						
						if (intentMatch && contentMatch) {
							const attributes: Record<string, string> = {};
							if (typeMatch) attributes.type = typeMatch[1];
							if (statusMatch) attributes.status = statusMatch[1];
							if (doneMatch) attributes.done = doneMatch[1];

							events.push({
								intent: intentMatch[1],
								content: contentMatch[1],
								attributes
							});
						}
					}
				});
				
				setParsedEvents(events);
			} catch (error) {
				console.error('Error parsing XML:', error);
				setParsedEvents([]);
			}
		}
	}, [state]);

	useEffect(() => {
		if (codeRef.current && state && !showInteractive) {
			// Apply syntax highlighting only when showing raw XML
			hljs.highlightElement(codeRef.current);
		}
	}, [state, showInteractive]);

	return state.thread.events.length > 0 && (
		<div className="mt-6 bg-white rounded-2xl shadow-xl overflow-hidden">
			<div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between">
				<h3 className="text-lg font-semibold flex items-center">
					<span className="mr-2">🧠</span>
					Context Window (XML) | Factor 03
				</h3>
				<div className="flex items-center space-x-2">
					<button
						onClick={() => setShowInteractive(!showInteractive)}
						className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors"
					>
						{showInteractive ? 'Show XML' : 'Interactive'}
					</button>
				</div>
			</div>
			<div className="p-6">
				{showInteractive ? (
					<div className="bg-gray-50 rounded-lg border max-h-[250px] overflow-y-auto">
						{parsedEvents.length > 0 ? (
							<div className="space-y-3 p-4">
								{parsedEvents.map((event, index) => (
									<div key={index} className="border-l-4 border-blue-200 pl-3">
										<div className="flex items-center space-x-2 mb-1">
											<span className="text-xs font-semibold text-gray-600 uppercase">
												{event.intent.replace('_', ' ')}
											</span>
											{event.attributes.type && (
												<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
													{event.attributes.type}
												</span>
											)}
											{event.attributes.status && (
												<span className={`text-xs px-2 py-0.5 rounded ${
													event.attributes.status === 'success' 
														? 'bg-green-100 text-green-700' 
														: 'bg-red-100 text-red-700'
												}`}>
													{event.attributes.status}
												</span>
											)}
										</div>
										<div className="text-sm text-gray-800 leading-relaxed">
											{makeLinksClickable(event.content)}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="p-4 text-gray-500 text-center">
								No events found in memory
							</div>
						)}
					</div>
				) : (
					<pre className="bg-gray-50 rounded-lg p-0 overflow-x-auto text-sm text-gray-800 border max-h-[250px] overflow-y-auto">
						<code ref={codeRef} className="language-xml block p-4">{formatXML(convertStateToXML(state))}</code>
					</pre>
				)}
			</div>
		</div>
	);
}

export default CodeViewer;