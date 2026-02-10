import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface MarkdownProps {
  content: string;
}

interface ComponentProps {
  children?: ReactNode;
}

// 解析内容，分离 think 标签和普通内容
function parseContent(content: string): { thinkContent: string | null; mainContent: string } {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/;
  const match = content.match(thinkRegex);
  
  if (match) {
    const thinkContent = match[1].trim();
    const mainContent = content.replace(thinkRegex, '').trim();
    return { thinkContent, mainContent };
  }
  
  return { thinkContent: null, mainContent: content };
}

// 思考过程折叠组件
function ThinkBlock({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 bg-surface-light hover:bg-surface-light/80 flex items-center justify-between text-sm text-slate-400 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI 思考过程
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div 
          className="px-4 py-3 bg-surface/50 text-xs text-slate-500 leading-relaxed border-t border-white/5"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      )}
    </div>
  );
}

export function Markdown({ content }: MarkdownProps) {
  const { thinkContent, mainContent } = parseContent(content);

  return (
    <div className="text-sm max-w-none">
      {thinkContent && <ThinkBlock content={thinkContent} />}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }: ComponentProps) => (
            <h1 className="text-xl font-bold mb-4 text-white border-b border-white/10 pb-3">
              {children}
            </h1>
          ),
          h2: ({ children }: ComponentProps) => (
            <h2 className="text-lg font-bold mb-3 mt-6 text-white">
              {children}
            </h2>
          ),
          h3: ({ children }: ComponentProps) => (
            <h3 className="text-base font-semibold mb-2 mt-4 text-slate-200">
              {children}
            </h3>
          ),
          ul: ({ children }: ComponentProps) => (
            <ul className="list-disc pl-5 mb-3 space-y-1 text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }: ComponentProps) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1 text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }: ComponentProps) => (
            <li className="text-slate-300">{children}</li>
          ),
          p: ({ children }: ComponentProps) => (
            <p className="mb-3 text-slate-300 leading-relaxed">{children}</p>
          ),
          strong: ({ children }: ComponentProps) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }: ComponentProps) => (
            <em className="italic text-slate-300">{children}</em>
          ),
          table: ({ children }: ComponentProps) => (
            <div className="overflow-x-auto my-4 border border-white/10 rounded-lg">
              <table className="w-full border-collapse text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }: ComponentProps) => (
            <thead className="bg-surface-light border-b border-white/10">
              {children}
            </thead>
          ),
          tbody: ({ children }: ComponentProps) => (
            <tbody className="divide-y divide-white/5">
              {children}
            </tbody>
          ),
          tr: ({ children }: ComponentProps) => (
            <tr className="hover:bg-white/5 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }: ComponentProps) => (
            <th className="px-3 py-2 text-left font-semibold text-slate-200 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }: ComponentProps) => (
            <td className="px-3 py-2 text-slate-400 whitespace-nowrap">
              {children}
            </td>
          ),
          code: ({ children }: ComponentProps) => (
            <code className="bg-surface-light px-1.5 py-0.5 rounded text-xs font-mono text-primary">
              {children}
            </code>
          ),
          pre: ({ children }: ComponentProps) => (
            <pre className="bg-surface border border-white/10 p-4 rounded-lg overflow-x-auto mb-4 text-xs">
              {children}
            </pre>
          ),
          blockquote: ({ children }: ComponentProps) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 py-2 mb-4 bg-primary/5 rounded-r-lg">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-white/10 my-6" />,
          br: () => <br />,
        }}
      >
        {mainContent}
      </ReactMarkdown>
    </div>
  );
}
