"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chat({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 bg-neutral-50">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={[
                  "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm border",
                  isUser
                    ? "bg-blue-600 text-white border-blue-600 max-w-[80%]"
                    : "bg-white text-neutral-900 border-neutral-200 max-w-[85%]",
                ].join(" ")}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => (
                      <p className="mb-3 last:mb-0 leading-7">{children}</p>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 space-y-2 my-3">
                        {children}
                      </ol>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 space-y-2 my-3">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="leading-7">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold underline underline-offset-4">
                        {children}
                      </strong>
                    ),
                    hr: () => (
                      <hr className="my-6 border-neutral-300" />
                    ),
                    code(props) {
                      const { inline, className, children, ...rest } =
                        props as any;

                      return inline ? (
                        <code className="bg-neutral-200 text-red-600 px-1.5 py-0.5 rounded text-sm">
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-[#0d0d0d] text-[#e6e6e6] p-4 rounded-xl overflow-x-auto text-sm my-4">
                          <code className={className} {...rest}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}