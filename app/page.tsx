"use client";

import ChatInput from "@/components/chatinput";
import Chat from "@/components/chat";
import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const testAI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setMessage("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
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
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <Chat messages={messages} />

      <ChatInput
        message={message}
        setMessage={setMessage}
        testAI={testAI}
      />
    </div>
  );
}