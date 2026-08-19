"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ChatInput from "@/components/chat/ChatInput";
import Chat from "@/components/chat/Chat";
import NeedProfileCard from "@/components/chat/NeedProfileCard";
import type { MissingKey } from "@/lib/profile-constants";
import { LABEL_BY_INTENT, type ChatIntent } from "@/lib/intent";

type Message = {
    role: "user" | "assistant";
    content: string;
    thinking?: string;
};

/** 첫 메시지를 고민하는 학생을 위한 시작 문구 */
const STARTERS: Partial<Record<ChatIntent, string[]>> = {
    WRITE: [
        "자소서 문항을 붙여넣을게요",
        "어떤 경험을 써야 할지 모르겠어요",
        "지원 동기부터 써 보고 싶어요",
    ],
    REVIEW: ["써 놓은 자소서를 붙여넣을게요", "이력서를 봐 주세요"],
    INTERVIEW: [
        "예상 질문을 만들어 주세요",
        "자기소개 답변을 연습하고 싶어요",
        "출결 관련 질문이 걱정돼요",
    ],
};

export default function AssistChatContainer({ intent }: { intent: ChatIntent }) {
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

    const [needKeys, setNeedKeys] = useState<MissingKey[]>([]);
    const [blocking, setBlocking] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const didInitRef = useRef(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const t = e.currentTarget;
        setAutoScroll(t.scrollHeight - t.scrollTop - t.clientHeight < 50);
    };

    const saveMessage = async (role: "user" | "assistant", content: string) => {
        const res = await fetch("/api/chat/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatSessionId: chatId, role, content }),
        });
        return res.ok;
    };

    const sendMessage = async (text: string, saveUserMessage = true) => {
        if (saveUserMessage) {
            const saved = await saveMessage("user", text);
            if (!saved) {
                router.replace("/");
                return;
            }
        }

        setMessages((prev) => [
            ...prev,
            { role: "user", content: text },
            { role: "assistant", content: "", thinking: "" },
        ]);

        const abortController = new AbortController();
        setController(abortController);
        setIsStreaming(true);

        let assistantContent = "";

        try {
            const history = [...messages, { role: "user", content: text }];

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: history.map((m) => ({ role: m.role, content: m.content })),
                    chatSessionId: chatId, // 서버가 이걸로 intent를 조회한다
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

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (!line.trim()) continue;

                    let data;
                    try {
                        data = JSON.parse(line);
                    } catch {
                        continue;
                    }

                    if (data.type === "readiness") {
                        setNeedKeys([...data.value.missing, ...data.value.weak]);
                        setBlocking(data.value.status === "BLOCKED");
                        continue;
                    }

                    if (data.type === "need") {
                        setNeedKeys(data.value);
                        setBlocking(false);
                        continue;
                    }

                    if (data.type === "content") assistantContent += data.value;

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
                            copy[copy.length - 1] = { ...last, content: last.content + data.value };
                        }
                        return copy;
                    });
                }
            }
        } catch (error) {
            if ((error as Error).name !== "AbortError") console.error(error);
        } finally {
            if (assistantContent.trim()) await saveMessage("assistant", assistantContent);
            setIsStreaming(false);
            setController(null);
        }
    };

    const stopAI = () => {
        controller?.abort();
        setController(null);
        setIsStreaming(false);
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!message.trim() || isStreaming) return;

        const text = message;
        setMessage("");
        setShouldScroll(true);
        sendMessage(text);
    };

    /* 기존 메시지 불러오기 */
    useEffect(() => {
        if (!chatId || didInitRef.current) return;
        didInitRef.current = true;

        const firstMessage = sessionStorage.getItem(`first:${chatId}`);
        if (firstMessage) {
            sessionStorage.removeItem(`first:${chatId}`);
            setShouldScroll(true);
            sendMessage(firstMessage, false);
            return;
        }

        (async () => {
            const res = await fetch(`/api/chat/session/${chatId}`);
            if (!res.ok) {
                router.replace("/");
                return;
            }
            const data = await res.json();
            setMessages(
                data.map((m: { role: string; content: string }) => ({
                    role: m.role,
                    content: m.content,
                }))
            );
        })();
    }, [chatId]);

    useEffect(() => {
        if (!autoScroll && !shouldScroll) return;
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
        if (shouldScroll) setShouldScroll(false);
    }, [messages]);

    const starters = STARTERS[intent] ?? [];
    const isEmpty = messages.length === 0;

    return (
        <div className="flex h-screen flex-col bg-(--bg)">
            {/* 모드 배지 */}
            <div className="flex items-center gap-2 border-b border-(--start-card-border) px-6 py-3">
                <span className="rounded-md bg-(--start-accent)/10 px-2.5 py-1 text-xs font-semibold text-(--start-accent)">
                    {LABEL_BY_INTENT[intent]}
                </span>
            </div>

            {isEmpty ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6">
                    <h2 className="text-xl font-semibold text-(--start-title)">
                        {LABEL_BY_INTENT[intent]}을 시작할까요?
                    </h2>
                    <p className="mt-2.5 text-[15px] text-(--start-description)">
                        입력한 내 정보를 참고해서 도와드립니다.
                    </p>

                    <div className="mt-7 flex w-full max-w-lg flex-col gap-2.5">
                        {starters.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => {
                                    setShouldScroll(true);
                                    sendMessage(s);
                                }}
                                className="rounded-xl border border-(--start-card-border) bg-(--start-card-bg) px-5 py-4 text-left text-[15px] text-(--start-title) transition-all hover:border-(--start-accent) hover:bg-(--start-card-hover)"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <Chat messages={messages} bottomRef={bottomRef} handleScroll={handleScroll} />
            )}

            {/* 부족한 정보 안내 — 입력창 바로 위에 둬서 놓치지 않게 */}
            {needKeys.length > 0 && (
                <div className="w-full bg-(--chat-background)">
                <div className="mx-auto w-full max-w-4xl px-4">
                    <NeedProfileCard
                        keys={needKeys}
                        promptType={intent.toLowerCase()}
                        blocking={blocking}
                        chatId={chatId}
                    />
                </div>
                </div>
            )}

            <ChatInput
                message={message}
                setMessage={setMessage}
                testAI={submit}
                stopAI={stopAI}
                isStreaming={isStreaming}
                thinkingMode={thinkingMode}
                setThinkingMode={setThinkingMode}
                mode="chat"
            />
        </div>
    );
}