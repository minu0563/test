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
  const chatId = pathname.split("/")[2];

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [controller, setController] = useState<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const didInitRef = useRef(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    setAutoScroll(isBottom);
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    const res = await fetch("/api/chat/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatSessionId: chatId,
        role,
        content,
      }),
    });

    return res.ok;
  };

  const sendMessage = async (text: string, saveUserMessage = true) => {
    if (saveUserMessage) {
      const saved = await saveMessage("user", text);
      if (!saved) {
        console.error("Failed to save user message");
        setAuthorized(false);
        router.replace("/sc");
        return;
      }
    }

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      thinking: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    const abortController = new AbortController();
    setController(abortController);
    setIsStreaming(true);

    let assistantContent = "";

    try {
      const history = [
        ...messages,
        {
          role: "user",
          content: text,
        }
      ];


      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: history.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
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

          if (data.type === "content") {
            assistantContent += data.value;
          }

          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];

            if (data.type === "thinking") {
              copy[copy.length - 1] = {
                ...last,
                thinking: (last.thinking || "") + data.value,
              };
            }

            if (data.type === "content") {
              copy[copy.length - 1] = {
                ...last,
                content: last.content + data.value,
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
      if (assistantContent.trim()) {
        await saveMessage("assistant", assistantContent);
      }

      setIsStreaming(false);
      setController(null);
    }
  };

  const stopAI = () => {
    controller?.abort();
    setController(null);
    setIsStreaming(false);
  };

  const testAI = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message.trim()) return;

    const text = message;
    setMessage("");

    if (pathname === "/") {
      const id = uuid();

      sessionStorage.setItem("firstMessage", text);
      router.push(`/c/${id}`);
      return;
    }

    setShouldScroll(true);
    sendMessage(text);
  };

  useEffect(() => {
    if (!chatId || didInitRef.current) return;
    didInitRef.current = true;

    const firstMessage = sessionStorage.getItem("firstMessage");

    if (firstMessage) {
      sessionStorage.removeItem("firstMessage");
      setAuthorized(true);
      setShouldScroll(true);
      sendMessage(firstMessage, false);
      return;
    }

    const loadMessages = async () => {
      const res = await fetch(`/api/chat/session/${chatId}`);

      if (res.ok) {
        const data = await res.json();
        setMessages(data.map((msg: any) => ({ role: msg.role, content: msg.content })));
        setAuthorized(true);
      } else {
        setAuthorized(false);
        router.replace("/sc");
      }
    };

    loadMessages();
  }, [chatId]);

  useEffect(() => {
    if (!autoScroll && !shouldScroll) return;

    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });

    if (shouldScroll) {
      setShouldScroll(false);
    }

  }, [messages]);

  return (
    <div className="flex h-screen flex-col bg-(--bg)">
      <Chat messages={messages} bottomRef={bottomRef} handleScroll={handleScroll} />

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