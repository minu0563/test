"use client";

import ChatInput from "@/components/chatinput";
import Chat from "@/components/chat";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [controller, setController] = useState<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
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
        }),
        signal: abortController.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        fullText += chunk;

        setMessages((prev) => {
          const copy = [...prev];

          copy[copy.length - 1] = {
            role: "assistant",
            content: fullText,
          };

          return copy;
        });
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


  return (
    <div className="flex h-screen flex-col bg-white">
      <Chat messages={messages} />

      <ChatInput
        message={message}
        setMessage={setMessage}
        testAI={testAI}
        stopAI={stopAI}
        isStreaming={isStreaming}
      />
    </div>
  );
}