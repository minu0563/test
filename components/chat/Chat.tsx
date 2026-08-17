"use client";

import { useState, useEffect, useRef } from "react";
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
  bottomRef,
  handleScroll,
}: {
  messages: Message[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: React.UIEventHandler<HTMLDivElement>;

}) {
  const [opened, setOpened] = useState<number | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<number[]>([]);
  const [hasOverflow, setHasOverflow] = useState<number[]>([]);

  const userContentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const overflowIndexes: number[] = [];

    userContentRefs.current.forEach((el, index) => {
      if (!el) return;

      if (el.scrollHeight > el.clientHeight) {
        overflowIndexes.push(index);
      }
    });

    setHasOverflow(prev => {
      if (
        prev.length === overflowIndexes.length &&
        prev.every((value, index) => value === overflowIndexes[index])
      ) {
        return prev;
      }

      return overflowIndexes;
    });
  }, [messages]);

  return (
    <div onScroll={handleScroll} className="chat-scrollbar flex flex-1 flex-col overflow-y-auto bg-(--chat-background) px-4 py-6 pb-30">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          const isExpanded = expandedUsers.includes(index);

          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={
                  isUser
                    ? "rounded-2xl border px-4 py-3 shadow-sm max-w-[60%] border-(--user-chat) bg-(--user-chat) text-(--user-text)"
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
                  <>
                    <div
                      ref={(el) => {
                        userContentRefs.current[index] = el;
                      }}
                      className={`overflow-hidden whitespace-pre-wrap break-words ${isExpanded ? "" : "max-h-50"
                        }`}
                    >
                      {msg.content}
                    </div>

                    {(hasOverflow.includes(index) || isExpanded) && (
                      <button
                        onClick={() =>
                          setExpandedUsers(prev =>
                            prev.includes(index)
                              ? prev.filter(i => i !== index)
                              : [...prev, index]
                          )
                        }
                        className="mt-2 text-l font-medium text-(--user-text) hover:underline"
                      >
                        {isExpanded ? "접기" : "더보기"}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-(--aichat-border)/70 bg-(--aichat-background) px-5 py-4 text-[15px] leading-relaxed text-(--aichat-text) shadow-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        p: ({ children }) => <p className="mb-4 last:mb-0 leading-7">{children}</p>,

                        h1: ({ children }) => <h1 className="mt-7 mb-3 text-2xl font-bold text-(--aichat-text) first:mt-0">{children}</h1>,

                        h2: ({ children }) => <h2 className="mt-6 mb-3 text-xl font-semibold text-(--aichat-text) first:mt-0">{children}</h2>,

                        h3: ({ children }) => <h3 className="mt-5 mb-2 text-lg font-semibold text-(--aichat-text) first:mt-0">{children}</h3>,

                        ul: ({ children }) => <ul className="my-4 ml-6 list-disc space-y-2 text-(--aichat-list)">{children}</ul>,

                        ol: ({ children }) => <ol className="my-4 ml-6 list-decimal space-y-2 text-(--aichat-list)">{children}</ol>,

                        li: ({ children }) => <li className="pl-1 marker:text-(--aichat-marker)">{children}</li>,

                        blockquote: ({ children }) => (
                          <blockquote className="my-5 rounded-r-xl border-l-4 border-(--aichat-block-border) bg-(--aichat-block-bg) px-4 py-3 italic text-(--aichat-block-text)">
                            {children}
                          </blockquote>
                        ),

                        code: ({ className, children }) => {
                          const isInline = !className;

                          return isInline ? (
                            <code className="rounded-md bg-(--aichat-code-bg) px-1.5 py-0.5 font-mono text-sm font-semibold text-(--aichat-code-text)">
                              {children}
                            </code>
                          ) : (
                            <pre className="my-5 overflow-x-auto rounded-xl bg-(--aichat-codeblock-bg) p-4 font-mono text-sm leading-6 text-(--aichat-codeblock-text) shadow-inner">
                              <code className={className}>{children}</code>
                            </pre>
                          );
                        },

                        table: ({ children }) => (
                          <div className="my-5 overflow-x-auto rounded-xl border border-(--aichat-table-border)">
                            <table className="w-full border-collapse text-sm">{children}</table>
                          </div>
                        ),

                        thead: ({ children }) => <thead className="border-b border-(--aichat-thead-border) bg-(--aichat-thead-bg) font-semibold text-(--aichat-thead-text)">{children}</thead>,

                        th: ({ children }) => <th className="px-4 py-3 text-left">{children}</th>,

                        td: ({ children }) => <td className="border-t border-(--aichat-td-border) px-4 py-3 text-(--aichat-td-text)">{children}</td>,

                        hr: () => <hr className="my-7 border-(--aichat-hr-border)" />,

                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-(--aichat-a-text) underline underline-offset-4 hover:text-(--aichat-a-text-hover)">
                            {children}
                          </a>
                        ),
                        strong: ({ children }) => (<strong className="font-bold">{children}</strong>
                        ),
                        br: () => <br />,
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

      <div ref={bottomRef} />
    </div>
  );
}