"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import ChatInput from "@/components/chat/ChatInput";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/login/LoginModal";

export default function StartChat() {
  const router = useRouter();
  const { status } = useSession();

  const [thinkingMode, setThinkingMode] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoginOpen, setLoginOpen] = useState(false);

  const startChat = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (status !== "authenticated") {
      setLoginOpen(true);
      return;
    }

    const id = uuid();

    await fetch("/api/chat/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        title: message.slice(0, 30),
        firstMessage: message,
      }),
    });

    sessionStorage.setItem(
      "firstMessage",
      message
    );

    router.push(`/c/${id}`);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className=" mb-10 text-4xl">
        뭐가 문제냐?
      </h1>

      <ChatInput
        message={message}
        setMessage={setMessage}
        testAI={startChat}
        stopAI={() => {}}
        isStreaming={false}
        thinkingMode={thinkingMode}
        setThinkingMode={setThinkingMode}
        mode="start"
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </div>
  );
}