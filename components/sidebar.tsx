"use client";

import { useRouter } from "next/navigation";
import LoginModal from "@/components/login/LoginModal";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const router = useRouter();
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

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

    const toggleTheme = () => {
        const next = !isDark;

        document.documentElement.classList.toggle("dark", next);

        localStorage.setItem(
            "theme",
            next ? "dark" : "light"
        );

        setIsDark(next);
    };

    return (
        <div className="w-12 md:w-48 lg:w-64 p-4 border-r border-(--sidebar-border) h-screen flex flex-col">
            <p className="hidden md:block text-4xl cursor-pointer text-(--text)"
                onClick={() => router.push("/sc")}>
                ResuMate
            </p>

            <p className="block md:hidden text-2xl font-bold text-(--text) text-center items-center cursor-pointer">
                +
            </p>

            <p className="hidden md:block mt-7 p-2 rounded text-(--text) font-bold cursor-pointer hover:bg-(--sidebar-newchat-hover)"
                onClick={() => router.push("/")}>
                새 태마
            </p>

            <div className="hidden md:block text-(--text) p-2 mt-5 font-bold">
                <p>최근 채팅</p>
            </div>

            <button onClick={toggleTheme}
                className="hidden md:block mt-auto mb-2 p-2 rounded text-left text-(--text) font-bold hover:bg-(--sidebar-newchat-hover)">
                {isDark ? "라이트 모드" : "다크 모드"}
            </button>

            <div className="hidden md:block p-2 text-(--text) font-bold cursor-pointer hover:bg-(--sideber-login-hover)"
                onClick={() => setLoginOpen(true)}>
                <p>login</p>
            </div>

            <LoginModal 
                isOpen={isLoginOpen}
                onClose={() => setLoginOpen(false)} />
        </div>
    );
}