"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "../../app/globals.css";

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
    <div className="flex flex-1 flex-col overflow-y-auto bg-(--chat-background) px-4 py-6">
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
                    ? "rounded-2xl border px-4 py-3 shadow-sm max-w-[80%] border-(--user-chat) bg-(--user-chat) text-(--user-text)"
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
                      className="flex items-center gap-1.5 rounded-lg border border-(--thinking-border)/60 bg-(--bg) px-2.5 py-1 text-xs font-medium text-(--thinking-text) shadow-sm transition-all hover:bg-(--thinking-hover-bg) hover:text-(--thinking-hover-text)"
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
                      <div className="mt-2 max-w-none border-l-2 border-(--thinking-sideline) pl-4 py-1 text-sm leading-relaxed text-(--thinking-text)/90">
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
                  <div className="rounded-2xl border border-(--aichat-border)/70 bg-(--aichat-background) px-5 py-4 text-[15px] leading-relaxed text-(--aichat-text) shadow-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        h1: ({ children }) => <h1 className="mt-6 mb-2 text-xl font-bold text-(--aichat-text) first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="mt-5 mb-2 text-lg font-semibold text-(--aichat-text) first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="mt-4 mb-1.5 text-base font-semibold text-(--aichat-text) first:mt-0">{children}</h3>,
                        ul: ({ children }) => <ul className="mb-4 ml-5 list-disc space-y-1 text-(--aichat-list)">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-4 ml-5 list-decimal space-y-1 text-(--aichat-list)">{children}</ol>,
                        li: ({ children }) => <li className="marker:text-(--aichat-marker)">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="my-4 border-l-4 border-(--aichat-block-border) bg-(--aichat-block-bg) py-2 pl-4 pr-2 italic text-(--aichat-block-text) rounded-r-lg">
                            {children}
                          </blockquote>
                        ),
                        code: ({ className, children }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="rounded bg-(--aichat-code-bg) px-1.5 py-0.5 font-mono text-sm text-(--aichat-code-text) font-semibold">
                              {children}
                            </code>
                          ) : (
                            <pre className="my-4 overflow-x-auto rounded-xl bg-(--aichat-codeblock-bg) p-4 font-mono text-sm text-(--aichat-codeblock-text) shadow-inner">
                              <code className={className}>{children}</code>
                            </pre>
                          );
                        },
                        table: ({ children }) => (
                          <div className="my-4 overflow-x-auto rounded-lg border border-(--aichat-table-border) shadow-sm">
                            <table className="w-full border-collapse text-left text-sm">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-(--aichat-thead-bg) font-semibold text-(--aichat-thead-text) border-b border-(--aichat-thead-border)">{children}</thead>,
                        th: ({ children }) => <th className="px-4 py-2.5">{children}</th>,
                        td: ({ children }) => <td className="border-t border-(--aichat-td-border) px-4 py-2 text-(--aichat-td-text)">{children}</td>,
                        hr: () => <hr className="my-6 border-(--aichat-hr-border)" />,
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-(--aichat-a-text) font-medium underline underline-offset-4 hover:text-(--aichat-a-text-hover)">
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