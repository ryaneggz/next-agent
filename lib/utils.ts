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