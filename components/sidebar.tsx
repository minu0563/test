"use client";

import { useRouter, usePathname } from "next/navigation";
import LoginModal from "@/components/login/LoginModal";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { sessionHref, LABEL_BY_INTENT, type ChatIntent } from "@/lib/intent";

type ChatSession = {
    id: string;
    title: string;
    intent: ChatIntent;
    createdAt: string;
    updatedAt: string;
};

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const { status } = useSession();
    const [chats, setChats] = useState<ChatSession[]>([]);

    useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        const applyTheme = () => {
            const saved = localStorage.getItem("theme");

            if (saved) {
                setIsDark(saved === "dark");
                document.documentElement.classList.toggle("dark", saved === "dark");
            } else {
                setIsDark(media.matches);
                document.documentElement.classList.toggle("dark", media.matches);
            }
        };

        applyTheme();

        media.addEventListener("change", applyTheme);

        return () => {
            media.removeEventListener("change", applyTheme);
        };
    }, []);

    const fetchChats = async () => {
        const res = await fetch("/api/chat/session");

        if (res.ok) {
            const data = await res.json();
            setChats(data);
        }
    };

    useEffect(() => {
        if (status !== "authenticated") {
            setChats([]);
            return;
        }

        fetchChats();
    }, [status, pathname]);

    const toggleTheme = () => {
        const next = !isDark;

        document.documentElement.classList.toggle("dark", next);

        localStorage.setItem("theme", next ? "dark" : "light");

        setIsDark(next);
    };

    const deleteChat = async (id: string) => {
        const confirmDelete = confirm("채팅을 삭제하시겠습니까?");

        if (!confirmDelete) return;

        const target = chats.find((chat) => chat.id === id);

        const res = await fetch(`/api/chat/session/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setChats((prev) =>
                prev.filter((chat) => chat.id !== id)
            );

            // 지금 보고 있는 대화방을 지웠으면 시작 화면으로
            if (target && pathname === sessionHref(target.intent ?? "CHAT", id)) {
                router.push("/");
            }
        }
    };

    return (
        <aside className="w-12 md:w-56 lg:w-64 h-screen flex flex-col border-r border-(--sidebar-border) bg-(--bg) p-4">
            <div
                onClick={() => router.push("/")}
                className="hidden md:block text-4xl font-md cursor-pointer text-(--text) mb-6 select-none"
            >
                ResuMate
            </div>

            <div className="block md:hidden text-2xl font-bold text-(--text) text-center cursor-pointer">
                +
            </div>

            <button
                onClick={() => router.push("/")}
                className="hidden md:block w-full text-left px-3 py-2.5 rounded-xl font-semibold text-(--text) hover:bg-(--sidebar-newchat-hover) transition cursor-pointer"
            >
                + 새 테마
            </button>

            <div className="hidden md:flex flex-col mt-6 flex-1 overflow-hidden">
                <p className="px-3 mb-3 text-sm font-bold text-(--text) opacity-70">
                    최근 채팅
                </p>

                <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {chats.map((chat) => {
                        const intent = chat.intent ?? "CHAT";
                        const href = sessionHref(intent, chat.id);
                        const active = pathname === href;

                        return (
                            <div
                                key={chat.id}
                                className={`group flex items-center rounded-xl transition ${active
                                    ? "bg-(--sidebar-newchat-hover)"
                                    : "hover:bg-(--sidebar-newchat-hover)"
                                    }`}
                            >
                                <button
                                    onClick={() => router.push(href)}
                                    className={`min-w-0 flex-1 text-left px-3 py-2 cursor-pointer ${active
                                        ? "font-semibold text-(--text)"
                                        : "text-(--text) opacity-80"
                                        }`}
                                >
                                    <span className="block truncate text-[14px]">
                                        {chat.title}
                                    </span>

                                    {intent !== "CHAT" && (
                                        <span className="block text-[11px] text-(--text) opacity-50">
                                            {LABEL_BY_INTENT[intent]}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => deleteChat(chat.id)}
                                    className="hidden group-hover:block mr-2 text-(--text) opacity-60 cursor-pointer hover:opacity-100"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="hidden md:block mt-auto">
                <button
                    onClick={toggleTheme}
                    className="w-full px-3 py-2.5 rounded-xl text-left font-semibold text-(--text) hover:bg-(--sidebar-newchat-hover) transition mb-2"
                >
                    {isDark ? "라이트 모드" : "다크 모드"}
                </button>

                <button
                    onClick={() => setLoginOpen(true)}
                    className="w-full px-3 py-2.5 rounded-xl text-left font-semibold text-(--text) hover:bg-(--sidebar-newchat-hover) transition"
                >
                    {status !== "authenticated" ? "로그인" : "사용자"}
                </button>
            </div>

            <LoginModal
                isOpen={isLoginOpen}
                onClose={() => setLoginOpen(false)}
            />
        </aside>
    );
}