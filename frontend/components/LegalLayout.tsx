import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  content: string;
}

export default function LegalLayout({ title, lastUpdated, content }: LegalLayoutProps) {
  // Extract headings for Table of Contents from content
  const matches = content.matchAll(/^(##|###)\s+(.*)$/gm);
  const headings: Heading[] = [];
  
  for (const m of matches) {
    const level = m[1] === '##' ? 2 : 3;
    const text = m[2].trim();
    if (text === "Footer Statement") continue;
    const id = text.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    headings.push({ level, text, id });
  }

  // Split content into body and footer statement
  const parts = content.split(/##\s+Footer\s+Statement/i);
  const mainContent = parts[0];
  const footerContent = parts[1] || '';

  // Custom components for ReactMarkdown to use our styling and set IDs
  const renderComponents = {
    h2: ({ node, children, ...props }: any) => {
      const text = String(children);
      const id = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      return (
        <h2
          id={id}
          className="text-xl md:text-2xl font-serif font-semibold text-[#D4A574] mt-10 mb-4 border-b border-[#2A2520] pb-2 scroll-mt-24"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ node, children, ...props }: any) => {
      const text = String(children);
      const id = text.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      return (
        <h3
          id={id}
          className="text-lg md:text-xl font-serif font-medium text-[#C6A972] mt-8 mb-3 scroll-mt-24"
          {...props}
        >
          {children}
        </h3>
      );
    },
    p: ({ node, children, ...props }: any) => {
      return (
        <p className="my-4 text-[#F0E8DC]/80 leading-relaxed text-sm md:text-base font-light" {...props}>
          {children}
        </p>
      );
    },
    ul: ({ node, children, ...props }: any) => {
      return (
        <ul className="list-disc pl-5 my-4 space-y-2 text-[#F0E8DC]/80 text-sm md:text-base font-light" {...props}>
          {children}
        </ul>
      );
    },
    ol: ({ node, children, ...props }: any) => {
      return (
        <ol className="list-decimal pl-5 my-4 space-y-2 text-[#F0E8DC]/80 text-sm md:text-base font-light" {...props}>
          {children}
        </ol>
      );
    },
    li: ({ node, children, ...props }: any) => {
      return (
        <li className="pl-1 text-[#F0E8DC]/80" {...props}>
          {children}
        </li>
      );
    },
    hr: ({ node, ...props }: any) => {
      return <hr className="border-[#2A2520] my-8" {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0805] text-[#F0E8DC] font-sans pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-[#2A2520] pb-8 mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#D4A574] tracking-wide mb-4">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-[#A89968] tracking-widest uppercase">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Table of Contents - Left Column (Sticky) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 bg-[#15110c] border border-[#2A2520] rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto hidden lg:block">
              <h2 className="text-sm font-serif font-bold text-[#D4A574] uppercase tracking-wider mb-4 border-b border-[#2A2520] pb-2">
                Table of Contents
              </h2>
              <nav className="space-y-2">
                {headings.map((heading) => (
                  <Link
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`block text-xs transition-colors hover:text-[#D4A574] leading-relaxed ${
                      heading.level === 2
                        ? 'text-[#A89968] font-medium pl-0'
                        : 'text-[#8B7355] font-light pl-3'
                    }`}
                  >
                    {heading.text}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Document Content - Right Column */}
          <main className="lg:col-span-3">
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown components={renderComponents}>
                {mainContent}
              </ReactMarkdown>
            </article>

            {/* Footer Statement callout box */}
            {footerContent && (
              <div className="mt-12 p-6 rounded-lg bg-[#1a1510] border border-[#D4A574]/30 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#D4A574]"></div>
                <h3 className="text-sm font-serif font-bold text-[#D4A574] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4A574] animate-pulse"></span>
                  Footer Statement
                </h3>
                <div className="text-xs md:text-sm text-[#A89968] italic leading-relaxed font-light">
                  <ReactMarkdown components={renderComponents}>
                    {footerContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
