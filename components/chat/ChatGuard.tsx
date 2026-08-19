"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import LoginModal from "@/components/login/LoginModal";
import ChatPage from "./ChatContainer";

export default function ChatGuard() {
  const { status } = useSession();

  const [loginOpen, setLoginOpen] = useState(true);


  if (status === "loading") {
    return null;
  }


  if (status === "unauthenticated") {
    return (
      <LoginModal
        isOpen={loginOpen}
        onClose={() => {}}
      />
    );
  }


  return <ChatPage />;
}