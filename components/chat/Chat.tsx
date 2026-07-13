"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Message = {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
};

export default function Chat({
  messages,
}: {
  messages: Message[];
}) {
  const [opened, setOpened] = useState<number | null>(null);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-neutral-50 px-4 py-6">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={index}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={
                  isUser
                    ? "rounded-2xl border px-4 py-3 shadow-sm max-w-[80%] border-blue-600 bg-blue-600 text-white"
                    : "flex max-w-[85%] flex-col space-y-2"
                }
              >
                {!isUser && msg.thinking && (
                  <div className="w-full">
                    <button
                      onClick={() =>
                        setOpened(
                          opened === index ? null : index
                        )
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-neutral-200/60 bg-white px-2.5 py-1 text-xs font-medium text-neutral-500 shadow-sm transition-all hover:bg-neutral-50 hover:text-neutral-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          opened === index ? "rotate-180" : ""
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                      {opened === index ? "생각 과정 숨기기" : "생각 과정 보기"}
                    </button>

                    {opened === index && (
                      <div className="mt-2 max-w-none border-l-2 border-neutral-300 pl-4 py-1 text-sm leading-relaxed text-neutral-500/90">
                        <ReactMarkdown
                          remarkPlugins={[
                            remarkGfm,
                            remarkMath,
                          ]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {msg.thinking}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                )}

                {isUser ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <div className="rounded-2xl border border-neutral-200/70 bg-white px-5 py-4 text-[15px] leading-relaxed text-neutral-800 shadow-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        h1: ({ children }) => <h1 className="mt-6 mb-2 text-xl font-bold text-neutral-900 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="mt-5 mb-2 text-lg font-semibold text-neutral-900 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="mt-4 mb-1.5 text-base font-semibold text-neutral-900 first:mt-0">{children}</h3>,
                        ul: ({ children }) => <ul className="mb-4 ml-5 list-disc space-y-1 text-neutral-700">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-4 ml-5 list-decimal space-y-1 text-neutral-700">{children}</ol>,
                        li: ({ children }) => <li className="marker:text-neutral-400">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="my-4 border-l-4 border-neutral-300 bg-neutral-50 py-2 pl-4 pr-2 italic text-neutral-600 rounded-r-lg">
                            {children}
                          </blockquote>
                        ),
                        code: ({ className, children }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-sm text-red-600 font-semibold">
                              {children}
                            </code>
                          ) : (
                            <pre className="my-4 overflow-x-auto rounded-xl bg-neutral-900 p-4 font-mono text-sm text-neutral-100 shadow-inner">
                              <code className={className}>{children}</code>
                            </pre>
                          );
                        },
                        table: ({ children }) => (
                          <div className="my-4 overflow-x-auto rounded-lg border border-neutral-200 shadow-sm">
                            <table className="w-full border-collapse text-left text-sm">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-neutral-50 font-semibold text-neutral-700 border-b border-neutral-200">{children}</thead>,
                        th: ({ children }) => <th className="px-4 py-2.5">{children}</th>,
                        td: ({ children }) => <td className="border-t border-neutral-100 px-4 py-2 text-neutral-600">{children}</td>,
                        hr: () => <hr className="my-6 border-neutral-200" />,
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium underline underline-offset-4 hover:text-blue-800">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}