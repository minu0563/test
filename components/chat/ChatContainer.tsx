"use client";

import ChatInput from "@/components/chat/ChatInput";
import Chat from "@/components/chat/Chat";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";

type Message = {
  role: "user" | "assistant";
  content: string;
  thinking?: string;
};

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [controller, setController] = useState<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [thinkingMode, setThinkingMode] = useState(false);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    const isBottom =
      target.scrollHeight - target.scrollTop - target.clientHeight < 50;

    setAutoScroll(isBottom);
  };


  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      thinking: "",
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      assistantMessage,
    ]);

    const abortController = new AbortController();

    setController(abortController);
    setIsStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          promptType: "chat",
          thinkingMode,

        }),
        signal: abortController.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const data = JSON.parse(line);

          setMessages((prev) => {
            const copy = [...prev];

            const last = copy[copy.length - 1];

            if (data.type === "thinking") {
              copy[copy.length - 1] = {
                ...last,
                thinking:
                  (last.thinking || "") + data.value,
              };
            }

            if (data.type === "content") {
              copy[copy.length - 1] = {
                ...last,
                content:
                  last.content + data.value,
              };
            }

            return copy;
          });
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("AI 중지됨");
      } else {
        console.error(error);
      }
    } finally {
      setIsStreaming(false);
      setController(null);
    }
  };

  const stopAI = () => {
    controller?.abort();

    setController(null);
    setIsStreaming(false);
  };

  const testAI = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!message.trim()) return;

    const text = message;

    setMessage("");

    // 처음 채팅 생성
    if (pathname === "/") {
      const id = uuid();

      sessionStorage.setItem(
        "firstMessage",
        text
      );

      router.push(`/chat/${id}`);
      return;
    }

    sendMessage(text);
  };

  useEffect(() => {
    const firstMessage =
      sessionStorage.getItem("firstMessage");

    if (firstMessage) {
      sessionStorage.removeItem("firstMessage");

      sendMessage(firstMessage);
    }
  }, []);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
      });
    }
  }, [messages, autoScroll]);

  return (
    <div className="flex h-screen flex-col bg-(--bg)">
      <Chat
        messages={messages}
        bottomRef={bottomRef}
        handleScroll={handleScroll}
      />

      <ChatInput
        message={message}
        setMessage={setMessage}
        testAI={testAI}
        stopAI={stopAI}
        isStreaming={isStreaming}
        thinkingMode={thinkingMode}
        setThinkingMode={setThinkingMode}
        mode="chat"
      />

    </div>
  );
}