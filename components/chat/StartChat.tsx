"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import ChatInput from "@/components/chat/ChatInput";

export default function StartChat() {
  const router = useRouter();

  const [message, setMessage] = useState("");

  const startChat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;

    const id = uuid();

    sessionStorage.setItem(
      "firstMessage",
      message
    );

    router.push(`/chat/${id}`);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">

      <h1 className="mb-10 text-4xl ">
        뭐가 문제냐?
      </h1>

      <ChatInput
        message={message}
        setMessage={setMessage}
        testAI={startChat}
        stopAI={() => {}}
        isStreaming={false}
        mode="start"
      />

    </div>
  );
}