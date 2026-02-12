import { useState } from 'react';
import { cn } from '../LayoutHelpers';

/**
 * Premium Code Block Component with syntax highlighting
 * Inspired by Vercel's code display
 */

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

const CodeBlock = ({
  code,
  language = 'typescript',
  title,
  showLineNumbers = true,
  highlightLines = [],
  className,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');

  return (
    <div className={cn('rounded-xl overflow-hidden bg-elevated border border-border shadow-lg', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
          {title && (
            <span className="ml-2 text-xs font-medium text-text-secondary">{title}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors rounded hover:bg-elevated"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto scrollbar-thin text-sm">
          <code className="font-mono">
            {lines.map((line, index) => {
              const lineNumber = index + 1;
              const isHighlighted = highlightLines.includes(lineNumber);
              return (
                <div
                  key={index}
                  className={cn(
                    'flex',
                    isHighlighted && 'bg-primary/10 -mx-4 px-4 border-l-2 border-primary'
                  )}
                >
                  {showLineNumbers && (
                    <span className="inline-block w-8 text-right mr-4 text-text-tertiary select-none">
                      {lineNumber}
                    </span>
                  )}
                  <span className="text-text-primary">{line || ' '}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
