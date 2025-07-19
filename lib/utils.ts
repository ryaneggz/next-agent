import { AIMessageChunk } from "@langchain/core/messages";
import { concat, IterableReadableStream } from "@langchain/core/utils/stream";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatXML = (xmlString: string) => {
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

export const streamHandler = async (response: IterableReadableStream<AIMessageChunk>): Promise<AIMessageChunk | undefined> => {
  // Iterate over the response, only saving the last chunk
  let finalResult: AIMessageChunk | undefined;
  for await (const chunk of response) {
    if (finalResult) {
      finalResult = concat(finalResult, chunk);
    } else {
      finalResult = chunk;
    }
  }
  return finalResult;
}