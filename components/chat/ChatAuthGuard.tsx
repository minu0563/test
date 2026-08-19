"use client";

import { useSession } from "next-auth/react";
import LoginModal from "@/components/login/LoginModal";
import { useRouter } from "next/navigation";

export default function ChatAuthGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const { status } = useSession();
    const router = useRouter();

    if (status === "loading") {
        return null;
    }

    if (status === "unauthenticated") {
        return (
            <LoginModal
                isOpen={true}
                onClose={() => router.push("/")}
            />
        );
    }

    return children;
}