"use client";
import LoginForm from "@/components/login/LoginForm";
import UserForm from "@/components/login/UserForm"
import { useSession } from "next-auth/react";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { data: session, status } = useSession();

    if (!isOpen) return null;

    return (
        <>
            {/* 로그인 안된거 */}
            {status === "unauthenticated" ? (
                <div
                    className="fixed inset-0 z-50 bg-(--loginform-bg)/60 flex items-center justify-center"
                    onClick={onClose}
                >
                    <div
                        className="bg-(--bg) px-6 pb-6 pt-2 rounded shadow-lg border border-(--loginform-border)"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LoginForm onClose={onClose} />
                    </div>
                </div>
            ) : (
                <div
                    className="fixed inset-0 z-50 bg-(--loginform-bg)/60 flex items-center justify-center"
                    onClick={onClose}
                >
                    <div
                        className="bg-(--bg) px-6 pt-2 rounded shadow-lg border border-(--loginform-border)"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UserForm onClose={onClose} />
                    </div>
                </div>
            )}
        </>
    );
}