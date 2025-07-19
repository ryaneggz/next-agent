"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          />
        ),
        // Custom code block styling
        code: ({ inline, className, children, ...props }: any) => {
          if (inline) {
            return (
              <code
                className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono"
                {...props}
              >
                {children}
              </code>
            );
          }
          return (
            <code
              className={`${className} block bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto`}
              {...props}
            >
              {children}
            </code>
          );
        },
        // Custom pre styling for code blocks
        pre: ({ node, ...props }) => (
          <pre
            className="bg-gray-100 p-2 rounded overflow-x-auto text-xs"
            {...props}
          />
        ),
        // Custom paragraph styling
        p: ({ node, ...props }) => (
          <p className="mb-2 last:mb-0" {...props} />
        ),
        // Custom list styling
        ul: ({ node, ...props }) => (
          <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
        ),
        // Custom blockquote styling
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2"
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;