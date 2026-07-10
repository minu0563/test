"use client";
import LoginForm from "@/components/LoginForm";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center" onClick={onClose}>
            <div className="bg-white px-6 pb-6 pt-2 rounded shadow-lg" onClick={(e) => e.stopPropagation()}>
                <LoginForm onClose={onClose} />
            </div>
        </div>
    );
}